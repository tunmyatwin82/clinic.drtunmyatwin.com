/**
 * OpenClaw - Trending Topics Fetcher
 * 
 * This script uses Chrome DevTools Protocol (CDP) to fetch trending topics
 * from various news sources via the browser control.
 * 
 * Usage: node fetch-trending-topics.js
 */

const WebSocket = require('ws');

const BROWSER_PORT = process.env.BROWSER_PORT || 18792;

class TrendingTopicsFetcher {
    constructor() {
        this.ws = null;
        this.requestId = 0;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const http = require('http');

            http.get(`http://localhost:${BROWSER_PORT}/json/version`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const info = JSON.parse(data);
                        const wsUrl = info.webSocketDebuggerUrl;
                        console.log('✅ Connected to browser:', info.Browser);

                        this.ws = new WebSocket(wsUrl);
                        this.ws.on('open', () => resolve());
                        this.ws.on('error', reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }

    sendCommand(method, params = {}, sessionId = null) {
        return new Promise((resolve, reject) => {
            const id = ++this.requestId;
            const message = sessionId
                ? JSON.stringify({ id, method, params, sessionId })
                : JSON.stringify({ id, method, params });

            const timeout = setTimeout(() => {
                reject(new Error(`Timeout waiting for response to ${method}`));
            }, 30000);

            const handler = (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.id === id) {
                        clearTimeout(timeout);
                        this.ws.off('message', handler);
                        if (response.error) {
                            reject(response.error);
                        } else {
                            resolve(response.result);
                        }
                    }
                } catch (e) { }
            };

            this.ws.on('message', handler);
            this.ws.send(message);
        });
    }

    async createPage() {
        const result = await this.sendCommand('Target.createTarget', {
            url: 'about:blank'
        });
        return result.targetId;
    }

    async navigateTo(url, sessionId) {
        console.log(`🌐 Navigating to: ${url}`);

        await this.sendCommand('Page.enable', {}, sessionId);
        await this.sendCommand('Page.navigate', { url }, sessionId);

        // Wait for load event
        await new Promise(resolve => {
            const loadHandler = (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    if (msg.method === 'Page.loadEventFired' && msg.sessionId === sessionId) {
                        this.ws.off('message', loadHandler);
                        resolve();
                    }
                } catch (e) { }
            };
            this.ws.on('message', loadHandler);
            setTimeout(resolve, 15000);
        });

        // Wait for dynamic content
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    async fetchGoogleTrends() {
        console.log('\n📊 Fetching Google Trends...\n');

        const pageId = await this.createPage();
        const attachResult = await this.sendCommand('Target.attachToTarget', {
            targetId: pageId,
            flatten: true
        });
        const sessionId = attachResult.sessionId;

        try {
            await this.navigateTo('https://trends.google.com/trends/trendingsearches/daily?geo=US', sessionId);

            const script = `
                (function() {
                    const trends = [];
                    
                    // Try different selectors for Google Trends
                    const trendItems = document.querySelectorAll('[class*="trend"], [class*="search"], .feed-list-wrapper .details');
                    
                    trendItems.forEach((item, index) => {
                        try {
                            const titleEl = item.querySelector('.title, [class*="title"], a');
                            const trafficEl = item.querySelector('[class*="traffic"], [class*="searches"]');
                            
                            if (titleEl && titleEl.innerText) {
                                trends.push({
                                    rank: index + 1,
                                    title: titleEl.innerText.trim(),
                                    traffic: trafficEl ? trafficEl.innerText.trim() : ''
                                });
                            }
                        } catch (e) {}
                    });
                    
                    // Alternative: try getting all links
                    if (trends.length === 0) {
                        const links = document.querySelectorAll('a[href*="/trends/explore"]');
                        links.forEach((link, index) => {
                            if (link.innerText && link.innerText.trim()) {
                                trends.push({
                                    rank: index + 1,
                                    title: link.innerText.trim(),
                                    traffic: ''
                                });
                            }
                        });
                    }
                    
                    return trends.slice(0, 5);
                })()
            `;

            const result = await this.sendCommand('Runtime.evaluate', {
                expression: script,
                returnByValue: true
            }, sessionId);

            const trends = result.result?.value || [];

            if (trends.length > 0) {
                console.log('🔥 Top 5 Trending Topics (Google Trends):\n');
                trends.forEach((t, i) => {
                    console.log(`   ${i + 1}. ${t.title}${t.traffic ? ` (${t.traffic})` : ''}`);
                });
            } else {
                console.log('   Could not extract trends from Google Trends');
            }

            return trends;
        } finally {
            try {
                await this.sendCommand('Page.close', {}, sessionId);
            } catch (e) { }
        }
    }

    async fetchBBCNews() {
        console.log('\n📰 Fetching BBC News...\n');

        const pageId = await this.createPage();
        const attachResult = await this.sendCommand('Target.attachToTarget', {
            targetId: pageId,
            flatten: true
        });
        const sessionId = attachResult.sessionId;

        try {
            await this.navigateTo('https://www.bbc.com/news', sessionId);

            const script = `
                (function() {
                    const headlines = [];
                    
                    // BBC headline selectors
                    const selectors = [
                        'h3[data-testid="card-headline"]',
                        '.gs-c-promo-heading__title',
                        'a[href*="/news/"] h3',
                        '.media__title'
                    ];
                    
                    for (const selector of selectors) {
                        const items = document.querySelectorAll(selector);
                        items.forEach((item, index) => {
                            const text = item.innerText?.trim();
                            if (text && !headlines.includes(text)) {
                                headlines.push(text);
                            }
                        });
                        if (headlines.length >= 5) break;
                    }
                    
                    return headlines.slice(0, 5);
                })()
            `;

            const result = await this.sendCommand('Runtime.evaluate', {
                expression: script,
                returnByValue: true
            }, sessionId);

            const headlines = result.result?.value || [];

            if (headlines.length > 0) {
                console.log('🔥 Top 5 BBC News Headlines:\n');
                headlines.forEach((h, i) => {
                    console.log(`   ${i + 1}. ${h}`);
                });
            } else {
                console.log('   Could not extract headlines from BBC');
            }

            return headlines;
        } finally {
            try {
                await this.sendCommand('Page.close', {}, sessionId);
            } catch (e) { }
        }
    }

    async fetchReuters() {
        console.log('\n📰 Fetching Reuters...\n');

        const pageId = await this.createPage();
        const attachResult = await this.sendCommand('Target.attachToTarget', {
            targetId: pageId,
            flatten: true
        });
        const sessionId = attachResult.sessionId;

        try {
            await this.navigateTo('https://www.reuters.com', sessionId);

            const script = `
                (function() {
                    const headlines = [];
                    
                    // Reuters headline selectors
                    const items = document.querySelectorAll('h3, h2, [class*="headline"], [class*="title"]');
                    
                    items.forEach((item) => {
                        const text = item.innerText?.trim();
                        if (text && text.length > 20 && text.length < 200 && !headlines.includes(text)) {
                            headlines.push(text);
                        }
                    });
                    
                    return headlines.slice(0, 5);
                })()
            `;

            const result = await this.sendCommand('Runtime.evaluate', {
                expression: script,
                returnByValue: true
            }, sessionId);

            const headlines = result.result?.value || [];

            if (headlines.length > 0) {
                console.log('🔥 Top 5 Reuters Headlines:\n');
                headlines.forEach((h, i) => {
                    console.log(`   ${i + 1}. ${h}`);
                });
            } else {
                console.log('   Could not extract headlines from Reuters');
            }

            return headlines;
        } finally {
            try {
                await this.sendCommand('Page.close', {}, sessionId);
            } catch (e) { }
        }
    }

    async close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

async function main() {
    const fetcher = new TrendingTopicsFetcher();

    try {
        console.log('🦞 OpenClaw - Trending Topics Fetcher');
        console.log('=====================================\n');

        await fetcher.connect();

        // Fetch from multiple sources
        const allTopics = [];

        // Try Google Trends first
        try {
            const trends = await fetcher.fetchGoogleTrends();
            allTopics.push(...trends.map(t => t.title || t));
        } catch (e) {
            console.log('   Error fetching Google Trends:', e.message);
        }

        // If we don't have enough, try BBC
        if (allTopics.length < 5) {
            try {
                const bbc = await fetcher.fetchBBCNews();
                allTopics.push(...bbc);
            } catch (e) {
                console.log('   Error fetching BBC:', e.message);
            }
        }

        // If still not enough, try Reuters
        if (allTopics.length < 5) {
            try {
                const reuters = await fetcher.fetchReuters();
                allTopics.push(...reuters);
            } catch (e) {
                console.log('   Error fetching Reuters:', e.message);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🔥 TOP 5 TRENDING TOPICS:\n');

        const uniqueTopics = [...new Set(allTopics)].slice(0, 5);
        uniqueTopics.forEach((topic, i) => {
            console.log(`   ${i + 1}. ${topic}`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await fetcher.close();
    }
}

main();

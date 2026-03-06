/**
 * OpenClaw - Telegram News Fetcher
 * 
 * This script uses Chrome DevTools Protocol (CDP) to fetch trending news
 * from Telegram channels via the browser control.
 * 
 * Usage: node fetch-telegram-news.js [channel_name]
 * Example: node fetch-telegram-news.js duwun
 */

const WebSocket = require('ws');

const BROWSER_PORT = process.env.BROWSER_PORT || 18792;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || 'MySecureToken2026';

class TelegramNewsFetcher {
    constructor() {
        this.ws = null;
        this.requestId = 0;
        this.pageId = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            // First get the browser WebSocket URL
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
                } catch (e) {
                    // Ignore parsing errors
                }
            };

            this.ws.on('message', handler);
            this.ws.send(message);
        });
    }

    async getTargets() {
        const result = await this.sendCommand('Target.getTargets');
        return result.targetInfos;
    }

    async createPage() {
        const result = await this.sendCommand('Target.createTarget', {
            url: 'about:blank'
        });
        this.pageId = result.targetId;
        return result.targetId;
    }

    async takeScreenshot(sessionId) {
        try {
            const result = await this.sendCommand('Page.captureScreenshot', {
                format: 'png'
            }, sessionId);
            return result.data;
        } catch (e) {
            return null;
        }
    }

    async navigateToChannel(channelName) {
        // Use Telegram's web preview (t.me/s/...) which doesn't require login
        const url = `https://t.me/s/${channelName}`;
        console.log(`🌐 Navigating to: ${url}`);

        // Create new page
        const pageId = await this.createPage();

        // Attach to the page
        const attachResult = await this.sendCommand('Target.attachToTarget', {
            targetId: pageId,
            flatten: true
        });
        const sessionId = attachResult.sessionId;

        // Enable Page domain for events
        await this.sendCommand('Page.enable', {}, sessionId);

        // Navigate to the channel
        const navResult = await this.sendCommand('Page.navigate', { url }, sessionId);
        console.log(`   Navigation started, loaderId: ${navResult.loaderId}`);

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
            // Timeout after 15 seconds
            setTimeout(resolve, 15000);
        });

        console.log('   Page loaded, waiting for content...');

        // Additional wait for dynamic content
        await new Promise(resolve => setTimeout(resolve, 5000));

        return { pageId, sessionId };
    }

    async getPageContent(sessionId) {
        // Get the full HTML for debugging
        const docResult = await this.sendCommand('DOM.getDocument', {}, sessionId);
        const outerHTML = await this.sendCommand('DOM.getOuterHTML', {
            nodeId: docResult.root.nodeId
        }, sessionId);
        return outerHTML.outerHTML;
    }

    async extractMessages(sessionId) {
        // First, let's check what's on the page
        const debugScript = `
            (function() {
                const info = {
                    title: document.title,
                    url: window.location.href,
                    bodyClasses: document.body.className,
                    messageCount: document.querySelectorAll('.tgme_widget_message').length,
                    allClasses: [...new Set([...document.querySelectorAll('[class]')].map(e => e.className).filter(c => c.includes('tgme')))],
                    previewText: document.body.innerText.substring(0, 500)
                };
                return info;
            })()
        `;

        const debugResult = await this.sendCommand('Runtime.evaluate', {
            expression: debugScript,
            returnByValue: true
        }, sessionId);

        const pageInfo = debugResult.result ? debugResult.result.value : {};
        console.log('\n📄 Page Info:');
        console.log(`   Title: ${pageInfo.title}`);
        console.log(`   URL: ${pageInfo.url}`);
        console.log(`   Message elements found: ${pageInfo.messageCount}`);
        if (pageInfo.allClasses && pageInfo.allClasses.length > 0) {
            console.log(`   Telegram classes: ${pageInfo.allClasses.slice(0, 5).join(', ')}`);
        }

        // Check if we're on a valid Telegram preview page
        if (pageInfo.title && pageInfo.title.includes('Telegram')) {
            console.log('   ✅ Valid Telegram page detected');
        }

        // Extract message content using JavaScript
        const script = `
            (function() {
                const messages = [];
                
                // Try multiple selectors for Telegram messages
                const selectors = [
                    '.tgme_widget_message',
                    '.tgme_channel_history .tgme_widget_message',
                    '[class*="message"]'
                ];
                
                let messageElements = [];
                for (const selector of selectors) {
                    messageElements = document.querySelectorAll(selector);
                    if (messageElements.length > 0) break;
                }
                
                messageElements.forEach((el, index) => {
                    try {
                        const textEl = el.querySelector('.tgme_widget_message_text') || 
                                       el.querySelector('[class*="text"]');
                        const titleEl = el.querySelector('.tgme_widget_message_author') ||
                                        el.querySelector('[class*="author"]');
                        const timeEl = el.querySelector('.tgme_widget_message_date time') ||
                                       el.querySelector('time');
                        const linkEl = el.querySelector('.tgme_widget_message_date') ||
                                       el.querySelector('a[href*="t.me"]');
                        
                        const text = textEl ? textEl.innerText : '';
                        if (!text.trim()) return; // Skip empty messages
                        
                        messages.push({
                            index: messages.length + 1,
                            title: titleEl ? titleEl.innerText.trim() : '',
                            text: text.trim(),
                            time: timeEl ? timeEl.getAttribute('datetime') || timeEl.innerText : '',
                            link: linkEl ? linkEl.href : ''
                        });
                    } catch (e) {
                        // Skip problematic messages
                    }
                });
                
                return messages;
            })()
        `;

        const result = await this.sendCommand('Runtime.evaluate', {
            expression: script,
            returnByValue: true
        }, sessionId);

        return result.result ? result.result.value : [];
    }

    async fetchNews(channelName) {
        console.log(`\n📰 Fetching news from Telegram channel: @${channelName}\n`);

        let sessionId;
        try {
            const page = await this.navigateToChannel(channelName);
            sessionId = page.sessionId;

            const messages = await this.extractMessages(sessionId);

            if (messages.length === 0) {
                console.log('\n⚠️  No messages found.');
                console.log('   This could mean:');
                console.log('   - The channel is private');
                console.log('   - The channel doesn\'t exist');
                console.log('   - The channel has no public preview');
                console.log('\n   Try these popular public channels:');
                console.log('   - duwun (Duwun News)');
                console.log('   - bbcburmese (BBC Burmese)');
                console.log('   - voaburmese (VOA Burmese)');
                console.log('   - apb_news (APB News)');
                return [];
            }

            console.log(`\n✅ Found ${messages.length} messages:\n`);

            messages.slice(0, 10).forEach((msg, i) => {
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📌 Message ${msg.index}:`);
                if (msg.title) console.log(`   Channel: ${msg.title}`);
                if (msg.time) console.log(`   Time: ${msg.time}`);
                if (msg.text) {
                    const preview = msg.text.substring(0, 300);
                    console.log(`   Text: ${preview}${msg.text.length > 300 ? '...' : ''}`);
                }
                if (msg.link) console.log(`   Link: ${msg.link}`);
            });

            return messages;
        } finally {
            if (sessionId) {
                try {
                    await this.sendCommand('Page.close', {}, sessionId);
                } catch (e) {
                    // Ignore close errors
                }
            }
        }
    }

    async close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Main execution
async function main() {
    const channelName = process.argv[2] || 'duwun';

    const fetcher = new TelegramNewsFetcher();

    try {
        console.log('🦞 OpenClaw - Telegram News Fetcher');
        console.log('====================================\n');

        await fetcher.connect();
        const messages = await fetcher.fetchNews(channelName);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n✅ Successfully fetched ${messages.length} messages from @${channelName}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await fetcher.close();
    }
}

main();

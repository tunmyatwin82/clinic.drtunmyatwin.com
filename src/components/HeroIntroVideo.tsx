'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

function parseYouTubeId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

function resolveMp4Src(raw: string | undefined): string {
  const configured = raw?.trim();
  if (!configured) return '/doctor-intro.mp4';
  if (parseYouTubeId(configured)) return '/doctor-intro.mp4';
  if (configured.startsWith('http')) return configured;
  return configured.startsWith('/') ? configured : `/${configured}`;
}

function resolveYoutubeId(
  configuredUrl: string | undefined,
  configuredYoutube: string | undefined,
): string | null {
  const fromUrl = configuredUrl ? parseYouTubeId(configuredUrl) : null;
  const fromId = configuredYoutube ? parseYouTubeId(configuredYoutube) : null;
  return fromUrl ?? fromId ?? null;
}

type HeroIntroVideoProps = {
  title: string;
  className?: string;
};

function YouTubePlayButton() {
  return (
    <span className="hero-intro-video__yt-play" aria-hidden>
      <svg viewBox="0 0 68 48" width="68" height="48" focusable="false">
        <path
          className="hero-intro-video__yt-play-bg"
          d="M66.52 7.74c-.78-2.93-2.56-5.26-5.45-6.06C55.79.13 34 0 34 0S12.21.13 6.93 1.68c-2.89.8-4.67 3.13-5.45 6.06C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.56 5.26 5.45 6.06C12.21 47.87 34 48 34 48s21.79-.13 27.07-1.68c2.89-.8 4.67-3.13 5.45-6.06C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
          fill="#f00"
        />
        <path d="M45 24 27 14v20" fill="#fff" />
      </svg>
    </span>
  );
}

/** Hero intro — YouTube-style click-to-play embed or inline MP4 with controls. */
export function HeroIntroVideo({ title, className = '' }: HeroIntroVideoProps) {
  const configuredUrl = process.env.NEXT_PUBLIC_HERO_INTRO_VIDEO_URL;
  const configuredYoutube = process.env.NEXT_PUBLIC_HERO_INTRO_YOUTUBE_ID;

  const youtubeId = useMemo(
    () => resolveYoutubeId(configuredUrl, configuredYoutube),
    [configuredUrl, configuredYoutube],
  );
  const mp4Src = useMemo(() => resolveMp4Src(configuredUrl), [configuredUrl]);

  const [youtubeActive, setYoutubeActive] = useState(false);
  const [mp4Active, setMp4Active] = useState(false);
  const [mp4Failed, setMp4Failed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activateYoutube = useCallback(() => setYoutubeActive(true), []);

  const activateMp4 = useCallback(() => {
    setMp4Active(true);
    requestAnimationFrame(() => {
      const el = videoRef.current;
      if (!el) return;
      void el.play().catch(() => {
        /* autoplay blocked — controls remain usable */
      });
    });
  }, []);

  if (youtubeId) {
    if (youtubeActive) {
      return (
        <div className={`hero-intro-video hero-intro-video--playing ${className}`}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="hero-intro-video__iframe"
          />
        </div>
      );
    }

    return (
      <button
        type="button"
        className={`hero-intro-video hero-intro-video--facade ${className}`}
        onClick={activateYoutube}
        aria-label={title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          className="hero-intro-video__thumb"
        />
        <span className="hero-intro-video__facade-shade" aria-hidden />
        <YouTubePlayButton />
      </button>
    );
  }

  if (!mp4Failed) {
    if (mp4Active) {
      return (
        <div className={`hero-intro-video hero-intro-video--playing ${className}`}>
          <video
            ref={videoRef}
            className="hero-intro-video__player"
            controls
            playsInline
            preload="metadata"
            poster="/hero-telemed.png"
            onError={() => setMp4Failed(true)}
          >
            <source src={mp4Src} type="video/mp4" />
          </video>
        </div>
      );
    }

    return (
      <button
        type="button"
        className={`hero-intro-video hero-intro-video--facade ${className}`}
        onClick={activateMp4}
        aria-label={title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-telemed.png"
          alt=""
          className="hero-intro-video__thumb"
        />
        <span className="hero-intro-video__facade-shade" aria-hidden />
        <YouTubePlayButton />
      </button>
    );
  }

  return (
    <a
      href="https://www.youtube.com/@drtunmyatwin"
      target="_blank"
      rel="noopener noreferrer"
      className={`hero-intro-video hero-intro-video--facade ${className}`}
      aria-label={title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero-telemed.png" alt="" className="hero-intro-video__thumb" />
      <span className="hero-intro-video__facade-shade" aria-hidden />
      <YouTubePlayButton />
    </a>
  );
}

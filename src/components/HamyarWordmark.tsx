import React from 'react';

/**
 * The Hamyar wordmark.
 *
 * Inline rather than an <img> so it takes its colour from whatever it sits in:
 * the supplied file fills every letter with white, which is right on a dark
 * ground and invisible on the header. Drawing it with currentColor lets the
 * same mark be teal on white and white on teal without keeping two copies.
 *
 * The original file is kept at public/brand/hamyar-wordmark.svg for anything
 * outside the app that needs it.
 */
export const HamyarWordmark: React.FC<{ className?: string; title?: string }> = ({
  className = '',
  title = 'Hamyar',
}) => (
  <svg
    viewBox="0 0 416.08 80.39"
    className={className}
    role="img"
    aria-label={title}
    fill="currentColor"
  >
    <path d="M4.24.46h20.14c2.76,0,4.24,1.48,4.24,4.24v37.74c0,1.38.74,2.12,2.12,2.12h11.87c1.38,0,2.12-.74,2.12-2.12V4.7c0-2.76,1.48-4.24,4.24-4.24h20.14c2.76,0,4.24,1.48,4.24,4.24v71.02c0,2.76-1.48,4.24-4.24,4.24h-20.14c-2.76,0-4.24-1.48-4.24-4.24v-21.2c0-1.38-.74-2.12-2.12-2.12h-11.87c-1.38,0-2.12.74-2.12,2.12v21.2c0,2.76-1.48,4.24-4.24,4.24H4.24c-2.76,0-4.24-1.48-4.24-4.24V4.7C0,1.95,1.48.46,4.24.46Z" />
    <path d="M117.45,2.58l32.01,72.4c1.27,2.97,0,4.98-3.18,4.98h-63.39c-3.18,0-4.45-2.01-3.18-4.98L111.72,2.58c1.48-3.39,4.24-3.39,5.72,0Z" />
    <path d="M161.01,1.63l29.15,31.38c.95.95,2.01.95,2.97,0L222.28,1.63c2.65-2.86,5.19-1.8,5.19,2.01v72.08c0,2.76-1.48,4.24-4.24,4.24h-63.18c-2.76,0-4.24-1.48-4.24-4.24V3.64c0-3.82,2.54-4.88,5.19-2.01Z" />
    <path d="M235.11.46h61.69c1.59,0,2.23,1.06,1.59,2.54l-16.85,35.72c-.85,1.8-1.17,3.29-1.17,5.19v31.8c0,2.76-1.48,4.24-4.24,4.24h-20.14c-2.76,0-4.24-1.48-4.24-4.24v-31.38c0-1.91-.32-3.39-1.17-5.19L233.52,3.01c-.64-1.48,0-2.54,1.59-2.54Z" />
    <path d="M325.21,2.58l32.01,72.4c1.27,2.97,0,4.98-3.18,4.98h-63.39c-3.18,0-4.45-2.01-3.18-4.98L319.49,2.58c1.48-3.39,4.24-3.39,5.72,0Z" />
    <path d="M404.39,53.15l11.13,23.21c1.59,3.18-.42,5.09-3.6,3.39l-37.53-20.35c-1.48-.85-2.54-.11-2.54,1.48v16.96c0,1.38-.74,2.12-2.12,2.12h-4.03c-1.38,0-2.12-.74-2.12-2.12V4.7c0-2.76,1.48-4.24,4.24-4.24h19.4c15.48,0,27.99,12.61,27.99,28.09,0,8.69-3.92,16.54-10.18,21.73-.95.85-1.17,1.7-.64,2.86Z" />
  </svg>
);

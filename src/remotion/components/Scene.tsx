'use client';

import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { spring } from 'remotion';
import { useState } from 'react';

interface SceneProps {
  post: { imageUrl: string; caption: string };
  caption: string;
  animation: 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade';
  colorPalette: { primary: string; secondary: string; text: string };
}

export const Scene: React.FC<SceneProps> = ({ post, caption, animation, colorPalette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [imageError, setImageError] = useState(false);

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let opacity = 1;

  const progress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
  });

  switch (animation) {
    case 'zoom-in':
      scale = 1 + (1 - progress) * 0.2;
      break;
    case 'zoom-out':
      scale = 0.8 + progress * 0.2;
      break;
    case 'slide-up':
      translateY = (1 - progress) * 100;
      break;
    case 'fade':
      opacity = progress;
      break;
    default:
      break;
  }

  const captionOpacity = interpolate(frame, [15, 30], [0, 1]);

  const imageUrl = imageError ? null : post.imageUrl;

  return (
    <AbsoluteFill>
      {imageUrl ? (
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            opacity,
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <AbsoluteFill
          style={{
            backgroundColor: colorPalette.primary || '#6366f1',
            opacity: 0.3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>
            🖼️
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: colorPalette.text,
          fontSize: 40,
          fontWeight: 'bold',
          padding: 20,
          opacity: captionOpacity,
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};
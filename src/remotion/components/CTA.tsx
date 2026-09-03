'use client';

import { AbsoluteFill } from 'remotion';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CTAProps {
  text: string;
  brandHandle: string;
  colorPalette: { primary: string; secondary: string; text: string };
}

export const CTA: React.FC<CTAProps> = ({ text, brandHandle, colorPalette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounce = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 30,
  });

  const scale = 1 + (1 - bounce) * 0.1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colorPalette.secondary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          color: colorPalette.text,
          fontSize: 50,
          fontWeight: 'bold',
          textAlign: 'center',
          padding: 20,
        }}
      >
        {text}
      </div>
      <div
        style={{
          marginTop: 20,
          color: colorPalette.text,
          fontSize: 35,
          opacity: 0.8,
          backgroundColor: 'rgba(0,0,0,0.2)',
          padding: '10px 30px',
          borderRadius: 50,
        }}
      >
        {brandHandle}
      </div>
    </AbsoluteFill>
  );
};
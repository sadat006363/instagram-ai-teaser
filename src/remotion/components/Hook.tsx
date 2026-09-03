'use client';

import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { spring } from 'remotion';

interface HookProps {
  text: string;
  colorPalette: { primary: string; secondary: string; text: string };
}

export const Hook: React.FC<HookProps> = ({ text, colorPalette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.5,
    to: 1,
    durationInFrames: 30,
  });

  const opacity = interpolate(frame, [0, 15], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colorPalette.primary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          color: colorPalette.text,
          fontSize: 60,
          fontWeight: 'bold',
          textAlign: 'center',
          padding: 20,
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
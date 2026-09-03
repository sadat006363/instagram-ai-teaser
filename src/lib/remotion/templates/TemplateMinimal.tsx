'use client';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { spring } from 'remotion';

interface Scene {
  postIndex: number;
  duration: number;
  caption: string;
  animation: 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade';
}

interface TemplateMinimalProps {
  posts: any[];
  scenes: Scene[];
  hook: string;
  cta: string;
  brandHandle: string;
  colorPalette: string[];
}

export const TemplateMinimal = ({
  posts,
  scenes,
  hook,
  cta,
  brandHandle,
  colorPalette,
}: TemplateMinimalProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const primaryColor = colorPalette[0] || '#6b7280';
  const textColor = '#ffffff';

  let currentFrame = 0;
  const hookDuration = 2 * fps;
  const hookStart = currentFrame;
  currentFrame += hookDuration;

  const sceneSequences = scenes.map((scene) => {
    const start = currentFrame;
    const duration = scene.duration * fps;
    currentFrame += duration;
    return { ...scene, start, duration };
  });

  const ctaDuration = 2 * fps;
  const ctaStart = currentFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#111827' }}>
      {/* Hook - مینیمال */}
      <AbsoluteFill
        style={{
          backgroundColor: primaryColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 45,
            fontWeight: '700',
            color: textColor,
            textAlign: 'center',
            letterSpacing: 1,
          }}
        >
          {hook}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: '400',
            color: 'rgba(255,255,255,0.6)',
            marginTop: 8,
          }}
        >
          {brandHandle}
        </div>
      </AbsoluteFill>

      {/* صحنه‌ها - مینیمال */}
      {sceneSequences.map((scene, index) => (
        <AbsoluteFill key={index}>
          <Img
            src={posts[scene.postIndex]?.imageUrl || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.7,
            }}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: textColor,
              fontSize: 30,
              fontWeight: '500',
              padding: 20,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {scene.caption}
          </div>
        </AbsoluteFill>
      ))}

      {/* CTA - مینیمال */}
      <AbsoluteFill
        style={{
          backgroundColor: '#1f2937',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: '600',
            color: textColor,
            textAlign: 'center',
            padding: 20,
          }}
        >
          {cta}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: '400',
            color: 'rgba(255,255,255,0.6)',
            marginTop: 8,
          }}
        >
          {brandHandle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
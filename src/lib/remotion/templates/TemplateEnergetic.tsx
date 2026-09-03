'use client';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { spring } from 'remotion';

interface Scene {
  postIndex: number;
  duration: number;
  caption: string;
  animation: 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade';
}

interface TemplateEnergeticProps {
  posts: any[];
  scenes: Scene[];
  hook: string;
  cta: string;
  brandHandle: string;
  colorPalette: string[];
}

export const TemplateEnergetic = ({
  posts,
  scenes,
  hook,
  cta,
  brandHandle,
  colorPalette,
}: TemplateEnergeticProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const primaryColor = colorPalette[0] || '#ec4899';
  const secondaryColor = colorPalette[1] || '#f59e0b';

  let currentFrame = 0;
  const hookDuration = 1.5 * fps;
  const hookStart = currentFrame;
  currentFrame += hookDuration;

  const sceneSequences = scenes.map((scene) => {
    const start = currentFrame;
    const duration = scene.duration * fps;
    currentFrame += duration;
    return { ...scene, start, duration };
  });

  const ctaDuration = 1.5 * fps;
  const ctaStart = currentFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Hook */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 55,
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            padding: 20,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transform: `scale(${spring({ frame, fps, from: 0.5, to: 1, durationInFrames: 30 })})`,
          }}
        >
          {hook}
        </div>
      </AbsoluteFill>

      {/* صحنه‌ها */}
      {sceneSequences.map((scene, index) => {
        const scale = spring({ frame: frame - scene.start, fps, from: 1.2, to: 1, durationInFrames: 20 });
        return (
          <AbsoluteFill key={index}>
            <Img
              src={posts[scene.postIndex]?.imageUrl || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${scale})`,
              }}
            />
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
                color: '#fff',
                fontSize: 38,
                fontWeight: '800',
                padding: 20,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {scene.caption}
            </div>
          </AbsoluteFill>
        );
      })}

      {/* CTA */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: '900',
            color: '#fff',
            textAlign: 'center',
            padding: 20,
          }}
        >
          {cta}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: 'rgba(255,255,255,0.8)',
            marginTop: 10,
          }}
        >
          {brandHandle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
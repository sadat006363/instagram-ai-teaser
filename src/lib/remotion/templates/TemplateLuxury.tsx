'use client';


import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { spring } from 'remotion';

interface Scene {
  postIndex: number;
  duration: number;
  caption: string;
  animation: 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade';
}

interface TemplateLuxuryProps {
  posts: any[];
  scenes: Scene[];
  hook: string;
  cta: string;
  brandHandle: string;
  colorPalette: string[];
}

export const TemplateLuxury = ({
  posts,
  scenes,
  hook,
  cta,
  brandHandle,
  colorPalette,
}: TemplateLuxuryProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const primaryColor = colorPalette[0] || '#6366f1';
  const secondaryColor = colorPalette[1] || '#8b5cf6';

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
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Hook */}
      <AbsoluteFill
        style={{
          backgroundColor: primaryColor,
          opacity: 0.9,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 50,
            fontWeight: '300',
            color: '#ffffff',
            textAlign: 'center',
            padding: 20,
            letterSpacing: 2,
            fontFamily: 'Georgia, serif',
          }}
        >
          {hook}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: '300',
            color: 'rgba(255,255,255,0.6)',
            marginTop: 10,
            letterSpacing: 4,
          }}
        >
          {brandHandle}
        </div>
      </AbsoluteFill>

      {/* صحنه‌ها */}
      {sceneSequences.map((scene, index) => (
        <AbsoluteFill key={index}>
          <Img
            src={posts[scene.postIndex]?.imageUrl || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.8,
            }}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(to top, ${primaryColor}CC, transparent)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: '#ffffff',
              fontSize: 35,
              fontWeight: '300',
              padding: 20,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              fontFamily: 'Georgia, serif',
            }}
          >
            {scene.caption}
          </div>
        </AbsoluteFill>
      ))}

      {/* CTA */}
      <AbsoluteFill
        style={{
          backgroundColor: secondaryColor,
          opacity: 0.95,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 45,
            fontWeight: '300',
            color: '#ffffff',
            textAlign: 'center',
            padding: 20,
            letterSpacing: 2,
          }}
        >
          {cta}
        </div>
        <div
          style={{
            fontSize: 25,
            fontWeight: '300',
            color: 'rgba(255,255,255,0.7)',
            marginTop: 10,
          }}
        >
          {brandHandle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
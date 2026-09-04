'use client';

import { Player } from '@remotion/player';
import { VideoTeaser } from '@/remotion/compositions/VideoTeaser';
import { RemotionProps } from '@/lib/types/result.types';
import { useEffect, useState } from 'react';

interface TeaserPreviewProps {
  props: RemotionProps;
  className?: string;
}

export function TeaserPreview({ props, className = '' }: TeaserPreviewProps) {
  const [isReady, setIsReady] = useState(false);

  // ✅ بعد از ۱ ثانیه Player را آماده در نظر بگیریم
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const totalDuration = props.script.scenes.reduce((sum, s) => sum + s.duration, 2 + 2);
  const durationInFrames = Math.max(totalDuration * 30, 15 * 30);

  const safeProps: RemotionProps = {
    posts: props.posts && props.posts.length > 0 ? props.posts : [
      { id: 'placeholder', imageUrl: '', caption: 'محتوای نمونه', likesCount: 0 },
    ],
    script: {
      hook: props.script?.hook || '✨ محتوای جذاب!',
      scenes: props.script?.scenes && props.script.scenes.length > 0 
        ? props.script.scenes.map((s, i) => ({
            ...s,
            postIndex: Math.min(Math.max(s.postIndex ?? 0, 0), props.posts.length - 1),
            duration: Math.max(s.duration || 3, 2),
            caption: s.caption || `صحنه ${i + 1}`,
            animation: (s.animation || 'fade') as 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade',
          }))
        : [
            { postIndex: 0, duration: 5, caption: 'محتوای ویژه', animation: 'fade' as const },
            { postIndex: 0, duration: 5, caption: 'با ما همراه شوید', animation: 'slide-up' as const },
            { postIndex: 0, duration: 5, caption: 'تجربه‌ای متفاوت', animation: 'zoom-in' as const },
          ],
      cta: props.script?.cta || '🚀 همین حالا دنبال کنید!',
      brandHandle: props.script?.brandHandle || 'username',
      colorPalette: {
        primary: props.script?.colorPalette?.primary || '#6366f1',
        secondary: props.script?.colorPalette?.secondary || '#8b5cf6',
        text: props.script?.colorPalette?.text || '#FFFFFF',
      },
      audioMood: props.script?.audioMood || 'upbeat',
    },
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: '9/16' }}>
        <Player
          component={VideoTeaser as any}
          inputProps={safeProps}
          durationInFrames={durationInFrames}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          controls
          loop
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl pointer-events-none">
          <div className="text-white text-lg font-medium">⏳ در حال بارگذاری...</div>
        </div>
      )}
    </div>
  );
}
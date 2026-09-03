import React from 'react';
import { Composition } from 'remotion';
import { VideoTeaser } from './compositions/VideoTeaser';

// داده‌های Mock برای پیش‌نمایش در Remotion Studio
const defaultTeaserProps = {
  posts: [
    {
      id: '1',
      imageUrl: 'https://picsum.photos/seed/a/1080/1920',
      caption: 'لحظات خاص با ما',
      likesCount: 120,
    },
    {
      id: '2',
      imageUrl: 'https://picsum.photos/seed/b/1080/1920',
      caption: 'طراحی مدرن و جذاب',
      likesCount: 340,
    },
    {
      id: '3',
      imageUrl: 'https://picsum.photos/seed/c/1080/1920',
      caption: 'محتوای ویریال',
      likesCount: 210,
    },
  ],
  script: {
    hook: '✨ راز موفقیت پیج‌های برتر اینستاگرام!',
    scenes: [
      {
        postIndex: 0,
        duration: 4,
        caption: 'لحظات خاص با ما',
        animation: 'zoom-in',
      },
      {
        postIndex: 1,
        duration: 4,
        caption: 'طراحی مدرن و جذاب',
        animation: 'fade',
      },
      {
        postIndex: 2,
        duration: 4,
        caption: 'محتوای ویریال',
        animation: 'slide-up',
      },
    ],
    cta: '⚡ همین حالا دنبال کنید!',
    brandHandle: '@username',
    colorPalette: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      text: '#FFFFFF',
    },
    audioMood: 'upbeat',
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoTeaser"
        component={VideoTeaser as any} // ✅ استفاده از as any برای رفع خطای تایپ
        durationInFrames={15 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultTeaserProps}
      />
    </>
  );
};
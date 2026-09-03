'use client';

import { Player } from '@remotion/player';
import { VideoTeaser } from '@/remotion/compositions/VideoTeaser';
import { useEffect, useState } from 'react';
import { fetchInstagramProfile } from '@/app/actions/instagram.action';
import { generateTeaserScript } from '@/app/actions/script.action';

// ============================
//  تعریف تایپ‌های مورد نیاز
// ============================

type InstagramPost = {
  id: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
};

type Script = {
  hook: string;
  scenes: {
    postIndex: number;
    duration: number;
    caption: string;
    animation: 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade';
  }[];
  cta: string;
  brandHandle: string;
  colorPalette: {
    primary: string;
    secondary: string;
    text: string;
  };
  audioMood: string;
};

type ErrorState = {
  message: string;
  code?: string;
  details?: any;
} | null;

// ============================
//  کامپوننت اصلی
// ============================

export default function PreviewPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState<ErrorState>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // ۱. دریافت پروفایل (Mock یا واقعی)
        const profileRes = await fetchInstagramProfile('zuck');

        if (!profileRes.success || !profileRes.data) {
          setError({
            message: profileRes.error?.message || 'خطا در دریافت اطلاعات پروفایل',
          });
          setLoading(false);
          return;
        }

        // ۲. تولید فیلم‌نامه
        const scriptRes = await generateTeaserScript(profileRes.data);

        if (!scriptRes.success || !scriptRes.data) {
          setError({
            message: scriptRes.error?.message || 'خطا در تولید فیلم‌نامه',
          });
          setLoading(false);
          return;
        }

        // ✅ مقداردهی نهایی
        setPosts(profileRes.data.posts);
        setScript(scriptRes.data);
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : 'خطای ناشناخته در بارگذاری داده',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- نمایش وضعیت‌های مختلف ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-white bg-gray-900">
        ⏳ در حال آماده‌سازی ویدیو...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 bg-gray-900">
        ❌ {error.message}
      </div>
    );
  }

  // 🔥 Type Guard: اگر script وجود نداشته باشد، خطا نشان بده
  if (!script) {
    return (
      <div className="flex items-center justify-center h-screen text-yellow-400 bg-gray-900">
        ⚠️ فیلم‌نامه در دسترس نیست. لطفاً دوباره تلاش کنید.
      </div>
    );
  }

  // --- نمایش پیش‌نمایش ویدیو (با اطمینان از وجود script) ---

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-white mb-6">🎬 پیش‌نمایش تیزر</h1>
      <div className="w-[360px] md:w-[400px] rounded-xl overflow-hidden shadow-2xl">
        <Player
          component={VideoTeaser}
          inputProps={{
            posts,
            script, // ✅ حالا TypeScript می‌داند که script قطعاً وجود دارد (به دلیل Type Guard)
          }}
          durationInFrames={15 * 30}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{
            width: '100%',
            aspectRatio: '9/16',
          }}
          controls
          autoPlay
          loop
        />
      </div>
      <div className="mt-4 text-gray-400 text-sm">
        ⏱️ مدت زمان: ۱۵ ثانیه | 📱 نسبت ۹:۱۶
      </div>
    </div>
  );
}
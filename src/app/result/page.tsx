'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { renderAndUploadTeaser } from '@/app/actions/render.action';
import { TeaserPreview } from '@/components/teaser/TeaserPreview';
import { Button } from '@/components/ui/Button';
import { Loader2, Download, Copy, Share2, Check } from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'zuck';

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const process = async () => {
      try {
        const res = await renderAndUploadTeaser(username);
        if (res.success) {
          setResult(res);
        } else {
          setError(res.error?.message || 'خطا در ساخت تیزر');
        }
      } catch (e) {
        setError('خطای غیرمنتظره در ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    };

    process();
  }, [username]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تیزر اینستاگرام من',
        text: 'تیزر من با TeaseAI ساخته شده!',
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">در حال ساخت تیزر شما...</p>
        <p className="text-gray-500 text-sm">لطفاً چند لحظه صبر کنید</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl text-red-400 mb-2">خطا در ساخت تیزر</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  if (!result || !result.remotionProps) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-400">داده‌های تیزر در دسترس نیست.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          🎬 تیزر شما آماده است
        </h1>
        <p className="text-gray-400 text-center mb-8">
          پیش‌نمایش تیزر {username} را در زیر مشاهده کنید
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Preview Player */}
          <div className="lg:col-span-3">
            <TeaserPreview props={result.remotionProps} className="max-w-[420px] mx-auto" />
          </div>

          {/* Info & Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-effect rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-400">اطلاعات تیزر</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">نام کاربری</span>
                  <span className="text-white font-medium">@{username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">قالب</span>
                  <span className="text-white font-medium">{result.template?.name || 'پیش‌فرض'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">صحنه‌ها</span>
                  <span className="text-white font-medium">{result.scenePlan?.scenes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">مدت زمان</span>
                  <span className="text-white font-medium">۱۵ ثانیه</span>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-400">عملیات</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  icon={Download}
                  disabled
                >
                  دانلود به‌زودی
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  icon={copied ? Check : Copy}
                  onClick={handleCopyLink}
                >
                  {copied ? 'کپی شد!' : 'کپی لینک'}
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  icon={Share2}
                  onClick={handleShare}
                >
                  اشتراک‌گذاری
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                دانلود MP4 به‌زودی اضافه می‌شود
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
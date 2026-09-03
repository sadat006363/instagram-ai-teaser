'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { renderAndUploadTeaser } from '@/app/actions/render.action';
import { VideoPlayer } from '@/components/result/VideoPlayer';
import { VariantSelector } from '@/components/result/VariantSelector';
import { PaymentModal } from '@/components/result/PaymentModal';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'zuck';

  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variants = [
    { id: 'A', name: 'Variant A', style: 'Energetic', duration: '15s', resolution: '1080x1920', mood: 'Upbeat', recommended: true },
    { id: 'B', name: 'Variant B', style: 'Calm', duration: '15s', resolution: '1080x1920', mood: 'Minimal' },
    { id: 'C', name: 'Variant C', style: 'Bold', duration: '15s', resolution: '1080x1920', mood: 'Dynamic' },
  ];

  useEffect(() => {
    const process = async () => {
      try {
        const result = await renderAndUploadTeaser(username);
        if (result.success) {
          // ✅ اصلاح خطا: استفاده از ?? null
          setVideoUrl(result.videoUrl ?? null);
        } else {
          setError(result.error?.message || 'خطا در ساخت تیزر');
        }
      } catch (e) {
        setError('خطای غیرمنتظره');
      } finally {
        setLoading(false);
      }
    };

    process();
  }, [username]);

  const handleDownload = () => {
    setShowPayment(true);
  };

  const handlePayment = () => {
    alert('درگاه پرداخت در نسخه‌ی نهایی فعال می‌شود.');
    setShowPayment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">در حال ساخت تیزر شما...</p>
        <p className="text-gray-500 text-sm">حدود ۳۰ ثانیه زمان می‌برد</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl text-red-400">{error}</h2>
          <Button onClick={() => window.location.reload()} className="mt-4">
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🎬 تیزر شما آماده است</h1>
        <p className="text-gray-400 text-center mb-8">
          بهترین نسخه را انتخاب کنید و دانلود کنید
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <VideoPlayer
              videoUrl={videoUrl || ''}
              variantName={variants.find(v => v.id === selectedVariant)?.name || ''}
              hasWatermark={true}
              onDownload={handleDownload}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">انتخاب وریشن</h3>
              <VariantSelector
                variants={variants}
                selectedId={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-sm text-gray-300">
                نسخه‌ی رایگان دارای واترمارک است.
                <br />
                <button
                  onClick={handleDownload}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  دریافت بدون واترمارک
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPayment={handlePayment}
      />
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
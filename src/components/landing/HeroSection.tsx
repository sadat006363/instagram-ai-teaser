'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Zap, Film } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const HeroSection = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('لطفاً نام کاربری اینستاگرام را وارد کنید');
      return;
    }

    if (username.startsWith('@')) {
      setError('لطفاً بدون @ وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    // رفتن به صفحه‌ی نتیجه
    router.push(`/result?username=${encodeURIComponent(username)}`);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-5xl w-full">
        {/* Hero Content */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
            <Sparkles className="w-4 h-4" />
            هوش مصنوعی + ویدیو
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            تیزر اینستاگرام
            <br />
            <span className="gradient-primary bg-clip-text text-transparent">
              با یک کلیک
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            فقط آیدی پیج اینستاگرام را وارد کنید. AI ما بهترین پست‌ها را انتخاب می‌کند و یک تیزر ۱۵ ثانیه‌ای حرفه‌ای می‌سازد.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                @
              </span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری (مثلاً: zuck)"
                className="pl-10 h-14 text-lg bg-gray-800/50 border-gray-700 focus:border-indigo-500"
                error={error}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              icon={ArrowRight}
              disabled={loading}
              className="h-14 px-8"
            >
              {loading ? 'در حال ساخت...' : 'شروع کن'}
            </Button>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { icon: Zap, title: 'فوق‌العاده سریع', desc: 'کمتر از ۳۰ ثانیه تیزر شما آماده است' },
            { icon: Sparkles, title: 'هوش مصنوعی پیشرفته', desc: 'انتخاب بهترین پست‌ها و ساخت فیلم‌نامه' },
            { icon: Film, title: 'خروجی حرفه‌ای', desc: 'موشن‌گرافیک، موسیقی و زیرنویس جذاب' },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-effect rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
            >
              <feature.icon className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
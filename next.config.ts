import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ۱. برطرف کردن تداخل Turbopack با تنظیمات سفارشی Webpack
  turbopack: {},

  // ۲. تنظیمات سرور اکشن‌ها (در صورت نیاز به سایز بادی تا 2 مگابایت)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // ۳. تنظیمات مجاز کردن لود تصاویر ریموت (برای تصاویر پروفایل و تامبنیل‌ها)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // ۴. کانفیگ وب‌پک شما
  webpack: (config) => {
    config.module.rules.push({
      test: /\.d\.ts$/,
      loader: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;

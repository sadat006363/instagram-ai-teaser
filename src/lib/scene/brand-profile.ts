import { InstagramProfileData } from '@/lib/instagram/types/instagram.types';

export type BrandCategory = 'fashion' | 'food' | 'education' | 'beauty' | 'service' | 'personal';
export type BrandTone = 'luxury' | 'friendly' | 'bold' | 'professional' | 'minimal';
export type VisualEnergy = 'calm' | 'medium' | 'high';

export interface BrandProfile {
  category: BrandCategory;
  tone: BrandTone;
  colorPalette: string[];
  preferredLayout: 'image-heavy' | 'text-heavy' | 'balanced';
  visualEnergy: VisualEnergy;
  ctaStyle: 'follow' | 'visit' | 'buy' | 'contact';
}

/**
 * استخراج پروفایل برند از داده‌های پیج اینستاگرام
 */
export function analyzeBrandProfile(profile: InstagramProfileData): BrandProfile {
  console.log(`🐞 [BrandProfile] شروع آنالیز برند برای ${profile.username}`);

  // ۱. استخراج دسته‌بندی از بیو و کپشن‌ها
  const allText = profile.bio + ' ' + profile.posts.map(p => p.caption).join(' ');
  const category = detectCategory(allText);
  console.log(`🐞 [BrandProfile] دسته‌بندی: ${category}`);

  // ۲. تشخیص تن (Tone) از بیو و کپشن‌ها
  const tone = detectTone(allText);
  console.log(`🐞 [BrandProfile] تن: ${tone}`);

  // ۳. استخراج پالت رنگی از تصاویر (ساده‌شده)
  const colorPalette = extractColorPalette(profile);
  console.log(`🐞 [BrandProfile] پالت رنگی: ${colorPalette.join(', ')}`);

  // ۴. تشخیص انرژی بصری
  const visualEnergy = detectVisualEnergy(profile);
  console.log(`🐞 [BrandProfile] انرژی بصری: ${visualEnergy}`);

  return {
    category,
    tone,
    colorPalette,
    preferredLayout: detectPreferredLayout(profile),
    visualEnergy,
    ctaStyle: detectCTAStyle(profile),
  };
}

// ============= توابع کمکی (با منطق ساده برای MVP) =============

function detectCategory(text: string): BrandCategory {
  const keywords = {
    fashion: ['مد', 'لباس', 'استایل', 'فشن', 'fashion', 'style', 'outfit'],
    food: ['غذا', 'کافه', 'رستوران', 'آشپزی', 'food', 'restaurant', 'cafe'],
    education: ['آموزش', 'مدرسه', 'کلاس', 'یادگیری', 'education', 'learn', 'course'],
    beauty: ['زیبایی', 'آرایش', 'پوست', 'مو', 'beauty', 'makeup', 'skin'],
    service: ['خدمات', 'مشاوره', 'پروژه', 'service', 'consulting', 'project'],
  };

  for (const [cat, words] of Object.entries(keywords)) {
    if (words.some(w => text.toLowerCase().includes(w))) {
      return cat as BrandCategory;
    }
  }
  return 'personal';
}

function detectTone(text: string): BrandTone {
  if (text.includes('لوکس') || text.includes('خاص') || text.includes('premium')) return 'luxury';
  if (text.includes('دوستانه') || text.includes('خانوادگی') || text.includes('friendly')) return 'friendly';
  if (text.includes('حرفه‌ای') || text.includes('تخصصی') || text.includes('professional')) return 'professional';
  if (text.includes('جسور') || text.includes('پررنگ') || text.includes('bold')) return 'bold';
  return 'minimal';
}

function extractColorPalette(profile: InstagramProfileData): string[] {
  // در MVP از یک پالت پیش‌فرض استفاده می‌کنیم
  // در نسخه‌های بعدی، از تصاویر رنگ استخراج می‌شود
  return ['#6366f1', '#8b5cf6', '#ec4899'];
}

function detectVisualEnergy(profile: InstagramProfileData): VisualEnergy {
  const avgLikes = profile.posts.reduce((sum, p) => sum + p.likesCount, 0) / profile.posts.length;
  if (avgLikes > 500) return 'high';
  if (avgLikes > 200) return 'medium';
  return 'calm';
}

function detectPreferredLayout(profile: InstagramProfileData): 'image-heavy' | 'text-heavy' | 'balanced' {
  const avgCaptionLength = profile.posts.reduce((sum, p) => sum + p.caption.length, 0) / profile.posts.length;
  if (avgCaptionLength > 100) return 'text-heavy';
  if (avgCaptionLength < 30) return 'image-heavy';
  return 'balanced';
}

function detectCTAStyle(profile: InstagramProfileData): 'follow' | 'visit' | 'buy' | 'contact' {
  const text = profile.bio + ' ' + profile.posts.map(p => p.caption).join(' ');
  if (text.includes('خرید') || text.includes('فروش') || text.includes('shop')) return 'buy';
  if (text.includes('تماس') || text.includes('واتساپ') || text.includes('contact')) return 'contact';
  if (text.includes('سایت') || text.includes('لینک') || text.includes('visit')) return 'visit';
  return 'follow';
}
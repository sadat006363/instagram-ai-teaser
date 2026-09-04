import { InstagramProfileData } from '@/lib/instagram/types/instagram.types';
import { BrandProfile } from './brand-profile';
import { Script } from '@/lib/instagram/schemas/script.schema';
import { Template } from './template-selector';

export interface ScenePlan {
  templateId: string;
  scenes: Array<{
    type: 'hook' | 'showcase' | 'proof' | 'benefit' | 'cta';
    assetIndex: number;
    text: string;
    duration: number;
    animation: string;
  }>;
  colorVariant: string;
  musicMood: string;
}

/**
 * تولید یک صحنه placeholder در صورت نبود پست
 */
function createPlaceholderScene(index: number, type: 'hook' | 'showcase' | 'cta'): {
  type: 'hook' | 'showcase' | 'proof' | 'benefit' | 'cta';
  assetIndex: number;
  text: string;
  duration: number;
  animation: string;
} {
  const texts = {
    hook: '✨ محتوای جذاب در انتظار شماست!',
    showcase: '🎯 با ما همراه شوید',
    cta: '🚀 همین حالا دنبال کنید!',
  };
  return {
    type,
    assetIndex: 0,
    text: texts[type] || 'محتوای ویژه',
    duration: 3,
    animation: 'fade',
  };
}

/**
 * تبدیل فیلم‌نامه‌ی AI به یک Scene Plan ساختاریافته (با پشتیبانی از پست‌های خالی)
 */
export function generateScenePlan(
  script: Script,
  profile: InstagramProfileData,
  brandProfile: BrandProfile,
  template: Template
): ScenePlan {
  console.log(`🐞 [ScenePlan] شروع تولید سناریوی ساختاریافته...`);

  // ✅ ۱. اعتبارسنجی و آماده‌سازی پست‌ها
  const posts = profile.posts || [];
  const availablePostsCount = posts.length;

  console.log(`🐞 [ScenePlan] تعداد پست‌های موجود: ${availablePostsCount}`);

  // ✅ ۲. انتخاب بهترین پست‌ها (با امتیازدهی)
  let topPosts: any[] = [];
  if (availablePostsCount > 0) {
    const scoredPosts = posts.map((post, index) => ({
      ...post,
      index,
      score: calculatePostScore(post, brandProfile),
    }));
    const sorted = scoredPosts.sort((a, b) => b.score - a.score);
    topPosts = sorted.slice(0, 5);
    console.log(`🐞 [ScenePlan] ✅ ${topPosts.length} پست برتر انتخاب شدند`);
  } else {
    console.warn(`🐞 [ScenePlan] ⚠️ هیچ پستی موجود نیست. استفاده از Placeholder.`);
    // ✅ ۳. ایجاد داده‌های ساختگی برای placeholder
    topPosts = [
      { index: 0, caption: 'محتوای ویژه شماره ۱', imageUrl: '' },
      { index: 0, caption: 'محتوای ویژه شماره ۲', imageUrl: '' },
      { index: 0, caption: 'محتوای ویژه شماره ۳', imageUrl: '' },
    ];
  }

  // ✅ ۴. ساخت صحنه‌ها با بررسی امن
  const scenes = script.scenes.map((scene, i) => {
    // انتخاب پست با بررسی امن
    const postIndex = scene.postIndex ?? 0;
    const safePostIndex = Math.min(Math.max(0, postIndex), topPosts.length - 1);
    const post = topPosts[safePostIndex] || topPosts[0] || { index: 0, caption: 'محتوای پیش‌فرض', imageUrl: '' };

    // تعیین نوع صحنه
    let type: 'hook' | 'showcase' | 'proof' | 'benefit' | 'cta';
    if (i === 0) {
      type = 'hook';
    } else if (i === script.scenes.length - 1) {
      type = 'cta';
    } else {
      type = 'showcase';
    }

    // استخراج متن با فال‌بک
    const text = scene.caption || post.caption || `صحنه ${i + 1}`;

    return {
      type,
      assetIndex: post.index ?? 0,
      text: text.substring(0, 60), // محدودیت طول متن
      duration: scene.duration || 3,
      animation: scene.animation || 'fade',
    };
  });

  // ✅ ۵. اگر هیچ صحنه‌ای وجود نداشت، placeholder بساز
  if (scenes.length === 0) {
    console.warn(`🐞 [ScenePlan] ⚠️ هیچ صحنه‌ای تولید نشد. استفاده از Placeholder.`);
    scenes.push(createPlaceholderScene(0, 'hook'));
    scenes.push(createPlaceholderScene(1, 'showcase'));
    scenes.push(createPlaceholderScene(2, 'cta'));
  }

  // ✅ ۶. انتخاب رنگ و موسیقی بر اساس برند
  const colorVariant = brandProfile.colorPalette?.[0] || '#6366f1';
  const musicMood = brandProfile.visualEnergy === 'high' ? 'upbeat' : 'minimal';

  return {
    templateId: template.id,
    scenes,
    colorVariant,
    musicMood,
  };
}

/**
 * محاسبه امتیاز برای هر پست
 */
function calculatePostScore(post: any, brandProfile: BrandProfile): number {
  let score = 0;
  score += (post.likesCount || 0) / 100;
  score += (post.commentCount || 0) / 50;
  score += (post.caption?.length || 0) > 50 ? 10 : 5;
  if (post.imageUrl) score += 5;
  return score;
}
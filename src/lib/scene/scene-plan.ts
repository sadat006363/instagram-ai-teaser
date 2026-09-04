import { InstagramProfileData } from '@/lib/instagram/types/instagram.types';
import { BrandProfile } from './brand-profile';
import { Script } from '@/lib/instagram/schemas/script.schema';
import { Template } from './template-selector';

export interface ScenePlan {
  templateId: string;
  scenes: Array<{
    type: 'hook' | 'showcase' | 'cta';
    assetIndex: number;
    text: string;
    duration: number;
    animation: string;
  }>;
  colorVariant: string;
  musicMood: string;
}

function createPlaceholderScene(index: number, type: 'hook' | 'showcase' | 'cta'): {
  type: 'hook' | 'showcase' | 'cta';
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

export function generateScenePlan(
  script: Script,
  profile: InstagramProfileData,
  brandProfile: BrandProfile,
  template: Template
): ScenePlan {
  console.log(`🐞 [ScenePlan] شروع تولید سناریوی ساختاریافته...`);

  const posts = profile.posts || [];
  const availablePostsCount = posts.length;
  console.log(`🐞 [ScenePlan] تعداد پست‌های موجود: ${availablePostsCount}`);

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
    topPosts = [
      { index: 0, caption: 'محتوای ویژه شماره ۱', imageUrl: '' },
      { index: 1, caption: 'محتوای ویژه شماره ۲', imageUrl: '' },
      { index: 2, caption: 'محتوای ویژه شماره ۳', imageUrl: '' },
    ];
  }

  const scenes: Array<{
    type: 'hook' | 'showcase' | 'cta';
    assetIndex: number;
    text: string;
    duration: number;
    animation: string;
  }> = [];

  // Hook
  const hookText = script.hook || '✨ محتوای جذاب!';
  scenes.push({
    type: 'hook',
    assetIndex: 0,
    text: hookText,
    duration: 3,
    animation: 'zoom-in',
  });

  // Showcase scenes
  const showcaseScenes = script.scenes.slice(0, 3);
  if (showcaseScenes.length > 0) {
    showcaseScenes.forEach((scene, idx) => {
      const postIdx = Math.min(Math.max(scene.postIndex ?? 0, 0), topPosts.length - 1);
      const post = topPosts[postIdx] || topPosts[0];
      scenes.push({
        type: 'showcase',
        assetIndex: post.index ?? 0,
        text: scene.caption || post.caption || `صحنه ${idx + 1}`,
        duration: scene.duration || 3,
        animation: scene.animation || 'fade',
      });
    });
  } else {
    // اگر صحنه‌ای وجود نداشت، placeholder
    scenes.push({
      type: 'showcase',
      assetIndex: 0,
      text: 'محتوای ویژه',
      duration: 4,
      animation: 'slide-up',
    });
    scenes.push({
      type: 'showcase',
      assetIndex: 0,
      text: 'با ما همراه شوید',
      duration: 4,
      animation: 'fade',
    });
  }

  // CTA
  scenes.push({
    type: 'cta',
    assetIndex: 0,
    text: script.cta || '🚀 همین حالا دنبال کنید!',
    duration: 3,
    animation: 'zoom-out',
  });

  const colorVariant = brandProfile.colorPalette?.[0] || '#6366f1';
  const musicMood = brandProfile.visualEnergy === 'high' ? 'upbeat' : 'minimal';

  return {
    templateId: template.id,
    scenes,
    colorVariant,
    musicMood,
  };
}

function calculatePostScore(post: any, brandProfile: BrandProfile): number {
  let score = 0;
  score += (post.likesCount || 0) / 100;
  score += (post.commentCount || 0) / 50;
  score += (post.caption?.length || 0) > 50 ? 10 : 5;
  if (post.imageUrl) score += 5;
  return score;
}
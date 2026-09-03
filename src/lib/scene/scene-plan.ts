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
 * تبدیل فیلم‌نامه‌ی AI به یک Scene Plan ساختاریافته
 */
export function generateScenePlan(
  script: Script,
  profile: InstagramProfileData,
  brandProfile: BrandProfile,
  template: Template
): ScenePlan {
  console.log(`🐞 [ScenePlan] شروع تولید سناریوی ساختاریافته...`);

  // ۱. انتخاب بهترین پست‌ها (با امتیازدهی)
  const scoredPosts = profile.posts.map((post, index) => ({
    ...post,
    index,
    score: calculatePostScore(post, brandProfile),
  }));
  const sorted = scoredPosts.sort((a, b) => b.score - a.score);
  const topPosts = sorted.slice(0, 5);

  console.log(`🐞 [ScenePlan] ✅ ${topPosts.length} پست برتر انتخاب شدند`);

  // ۲. ساخت صحنه‌ها بر اساس فیلم‌نامه
  const scenes = script.scenes.map((scene, i) => {
    const post = topPosts[scene.postIndex] || topPosts[0];
    // تعیین نوع صحنه
    let type: 'hook' | 'showcase' | 'proof' | 'benefit' | 'cta';
    if (i === 0) {
      type = 'hook';
    } else if (i === script.scenes.length - 1) {
      type = 'cta';
    } else {
      type = 'showcase';
    }
    return {
      type,
      assetIndex: post.index,
      text: scene.caption || post.caption || '',
      duration: scene.duration || 3,
      animation: scene.animation || 'fade',
    };
  });

  // ۳. انتخاب رنگ و موسیقی بر اساس برند
  const colorVariant = brandProfile.colorPalette[0] || '#6366f1';
  const musicMood = brandProfile.visualEnergy === 'high' ? 'upbeat' : 'minimal';

  return {
    templateId: template.id,
    scenes: scenes as ScenePlan['scenes'], // 🔥 اصلاح نهایی: تبدیل صریح نوع
    colorVariant,
    musicMood,
  };
}

function calculatePostScore(post: any, brandProfile: BrandProfile): number {
  let score = 0;
  score += post.likesCount / 100;
  score += post.commentCount / 50;
  score += post.caption.length > 50 ? 10 : 5;
  if (post.imageUrl) score += 5;
  return score;
}
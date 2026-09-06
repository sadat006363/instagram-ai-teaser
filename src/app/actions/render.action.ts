'use server';

import { fetchInstagramProfile } from './instagram.action';
import { generateTeaserScript } from './script.action';
import { analyzeBrandProfile } from '@/lib/scene/brand-profile';
import { selectTemplate } from '@/lib/scene/template-selector';
import { generateScenePlan } from '@/lib/scene/scene-plan';
import { validateScenePlan } from '@/lib/scene/validator';
import { RenderActionResult } from '@/lib/types/result.types';

export async function renderAndUploadTeaser(username: string): Promise<RenderActionResult> {
  console.log(`🐞 [RenderAction] شروع پردازش هوشمند برای ${username}`);
  console.log(`🐞 [RenderAction] Preview mode: client (بدون رندر MP4 سروری)`);

  try {
    // ۱. دریافت پروفایل
    console.log(`🐞 [RenderAction] مرحله 1: دریافت پروفایل...`);
    const profileRes = await fetchInstagramProfile(username);
    if (!profileRes.success || !profileRes.data) {
      throw new Error(profileRes.error?.message || 'خطا در دریافت پروفایل');
    }

    // ۲. آماده‌سازی پست‌ها (حتی اگر خالی باشد)
    let safePosts = profileRes.data.posts || [];
    if (safePosts.length === 0) {
      console.warn(`🐞 [RenderAction] ⚠️ هیچ پستی یافت نشد. استفاده از placeholder.`);
      safePosts = [
        { id: 'p1', imageUrl: '', caption: 'محتوای ویژه', likesCount: 0 },
        { id: 'p2', imageUrl: '', caption: 'با ما همراه شوید', likesCount: 0 },
        { id: 'p3', imageUrl: '', caption: 'تجربه‌ای متفاوت', likesCount: 0 },
      ];
    }

    // ۳. آنالیز برند
    console.log(`🐞 [RenderAction] مرحله 2: آنالیز برند...`);
    const brandProfile = analyzeBrandProfile({
      ...profileRes.data,
      posts: safePosts,
    });

    // ۴. انتخاب قالب
    console.log(`🐞 [RenderAction] مرحله 3: انتخاب قالب...`);
    const template = selectTemplate(brandProfile, safePosts.length);

    // ۵. تولید فیلم‌نامه
    console.log(`🐞 [RenderAction] مرحله 4: تولید فیلم‌نامه...`);
    const scriptRes = await generateTeaserScript(profileRes.data);
    if (!scriptRes.success || !scriptRes.data) {
      throw new Error('خطا در تولید فیلم‌نامه');
    }

    // ۶. تولید Scene Plan
    console.log(`🐞 [RenderAction] مرحله 5: تولید سناریوی ساختاریافته...`);
    const plan = generateScenePlan(
      scriptRes.data,
      { ...profileRes.data, posts: safePosts },
      brandProfile,
      template
    );
    console.log(`🐞 [RenderAction] ✅ تعداد صحنه‌ها: ${plan.scenes.length}`);

    // ۷. اعتبارسنجی کیفیت
    const validation = validateScenePlan(plan);
    if (!validation.valid) {
      console.warn(`🐞 [RenderAction] ⚠️ خطاهای اعتبارسنجی:`, validation.errors);
    }

    // ۸. آماده‌سازی props برای Remotion Player
    const remotionProps = {
      posts: safePosts.map((p: any) => ({
        id: p.id || '',
        imageUrl: p.imageUrl || '',
        caption: p.caption || '',
        likesCount: p.likesCount || 0,
      })),
      script: {
        hook: scriptRes.data.hook || '✨ محتوای جذاب!',
        scenes: plan.scenes.map((s) => ({
          postIndex: s.assetIndex ?? 0,
          duration: s.duration || 3,
          caption: s.text || 'محتوای ویژه',
          animation: (s.animation || 'fade') as 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade',
        })),
        cta: scriptRes.data.cta || '🚀 همین حالا دنبال کنید!',
        brandHandle: profileRes.data.username || username,
        colorPalette: {
          primary: plan.colorVariant || '#6366f1',
          secondary: '#8b5cf6',
          text: '#FFFFFF',
        },
        audioMood: plan.musicMood || 'upbeat',
      },
    };

    console.log(`🐞 [RenderAction] ✅ Remotion Props آماده شد. تعداد پست‌ها: ${remotionProps.posts.length}`);

    return {
      success: true,
      profile: profileRes.data,
      brandProfile,
      template,
      script: scriptRes.data,
      scenePlan: plan,
      remotionProps,
      previewMode: 'client',
    };
  } catch (error) {
    console.error(`🐞 [RenderAction] ❌ خطا:`, error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'خطای ناشناخته در پردازش',
        code: 'RENDER_FAILED',
      },
    };
  }
}
'use server';

import fs from 'fs';
import { fetchInstagramProfile } from './instagram.action';
import { generateTeaserScript } from './script.action';
import { analyzeBrandProfile } from '@/lib/scene/brand-profile';
import { selectTemplate } from '@/lib/scene/template-selector';
import { generateScenePlan } from '@/lib/scene/scene-plan';
import { validateScenePlan } from '@/lib/scene/validator';
import { VideoRenderer } from '@/lib/remotion/renderer';
import { VideoStorage } from '@/lib/remotion/storage';
import { downloadAllPostImages } from '@/lib/utils/download-image';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function renderAndUploadTeaser(username: string) {
  console.log(`🐞 [RenderAction] شروع رندر هوشمند برای ${username}`);

  try {
    // ۱. دریافت پروفایل
    console.log(`🐞 [RenderAction] مرحله 1: دریافت پروفایل...`);
    const profileRes = await fetchInstagramProfile(username);
    if (!profileRes.success || !profileRes.data) {
      throw new Error('خطا در دریافت پروفایل');
    }

    // ۲. آنالیز برند
    console.log(`🐞 [RenderAction] مرحله 2: آنالیز برند...`);
    const brandProfile = analyzeBrandProfile(profileRes.data);

    // ۳. انتخاب قالب
    console.log(`🐞 [RenderAction] مرحله 3: انتخاب قالب...`);
    const template = selectTemplate(brandProfile, profileRes.data.posts.length);

    // ۴. تولید فیلم‌نامه
    console.log(`🐞 [RenderAction] مرحله 4: تولید فیلم‌نامه...`);
    const scriptRes = await generateTeaserScript(profileRes.data);
    if (!scriptRes.success || !scriptRes.data) {
      throw new Error('خطا در تولید فیلم‌نامه');
    }

    // ۵. تولید Scene Plan
    console.log(`🐞 [RenderAction] مرحله 5: تولید سناریوی ساختاریافته...`);
    const plan = generateScenePlan(
      scriptRes.data,
      profileRes.data,
      brandProfile,
      template
    );

    // ۶. اعتبارسنجی کیفیت
    console.log(`🐞 [RenderAction] مرحله 6: اعتبارسنجی کیفیت...`);
    const validation = validateScenePlan(plan);
    if (!validation.valid) {
      console.warn(`🐞 [RenderAction] ⚠️ خطاهای اعتبارسنجی:`, validation.errors);
    }

    // ۷. دانلود همه‌ی تصاویر پست‌ها
    console.log(`🐞 [RenderAction] مرحله 7: دانلود تصاویر پست‌ها...`);
    const postsWithLocalImages = await downloadAllPostImages(profileRes.data.posts);
    console.log(`🐞 [RenderAction] ✅ تصاویر پردازش شدند`);

    // ۸. رندر ویدیو
    console.log(`🐞 [RenderAction] مرحله 8: رندر ویدیو با قالب ${template.name}...`);
    const videoPath = await VideoRenderer.renderTeaser({
      posts: postsWithLocalImages,
      plan,
    });

    // ۹. آپلود در Supabase با کلاینت ادمین
    console.log(`🐞 [RenderAction] مرحله 9: آپلود در Supabase...`);
    const videoUrl = await VideoStorage.uploadVideo(videoPath);

    // ۱۰. پاک کردن فایل‌های موقت تصاویر
    console.log(`🐞 [RenderAction] پاک کردن فایل‌های موقت...`);
    postsWithLocalImages.forEach(post => {
      if (post.imageUrl && !post.imageUrl.startsWith('http') && !post.imageUrl.startsWith('data:')) {
        try { fs.unlinkSync(post.imageUrl); } catch (e) {}
      }
    });

    console.log(`🐞 [RenderAction] ✅ همه‌چیز کامل شد!`);
    return {
      success: true,
      videoUrl,
      templateName: template.name,
      sceneCount: plan.scenes.length,
    };
  } catch (error) {
    console.error(`🐞 [RenderAction] ❌ خطا:`, error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'خطای ناشناخته',
        code: 'RENDER_FAILED',
      },
    };
  }
}
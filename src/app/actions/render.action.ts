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

export async function renderAndUploadTeaser(username: string) {
  console.log(`🐞 [RenderAction] شروع رندر هوشمند برای ${username}`);

  try {
    // ۱. دریافت پروفایل
    console.log(`🐞 [RenderAction] مرحله 1: دریافت پروفایل...`);
    const profileRes = await fetchInstagramProfile(username);
    if (!profileRes.success || !profileRes.data) {
      throw new Error('خطا در دریافت پروفایل');
    }

    // ✅ ۲. بررسی و آماده‌سازی پست‌ها (حتی اگر خالی باشد)
    let safePosts = profileRes.data.posts || [];
    if (safePosts.length === 0) {
      console.warn(`🐞 [RenderAction] ⚠️ هیچ پستی یافت نشد. استفاده از پست placeholder.`);
      safePosts = [
        {
          id: 'placeholder-1',
          imageUrl: '',
          caption: 'محتوای ویژه',
          likesCount: 0,
        },
        {
          id: 'placeholder-2',
          imageUrl: '',
          caption: 'با ما همراه شوید',
          likesCount: 0,
        },
        {
          id: 'placeholder-3',
          imageUrl: '',
          caption: 'تجربه‌ای متفاوت',
          likesCount: 0,
        },
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

    // ۶. تولید Scene Plan (با پست‌های ایمن)
    console.log(`🐞 [RenderAction] مرحله 5: تولید سناریوی ساختاریافته...`);
    const plan = generateScenePlan(
      scriptRes.data,
      { ...profileRes.data, posts: safePosts },
      brandProfile,
      template
    );

    // ۷. اعتبارسنجی کیفیت
    console.log(`🐞 [RenderAction] مرحله 6: اعتبارسنجی کیفیت...`);
    const validation = validateScenePlan(plan);
    if (!validation.valid) {
      console.warn(`🐞 [RenderAction] ⚠️ خطاهای اعتبارسنجی:`, validation.errors);
    }

    // ۸. دانلود همه‌ی تصاویر پست‌ها
    console.log(`🐞 [RenderAction] مرحله 7: دانلود تصاویر پست‌ها...`);
    const postsWithLocalImages = await downloadAllPostImages(safePosts);
    console.log(`🐞 [RenderAction] ✅ تصاویر پردازش شدند`);

    // ۹. رندر ویدیو
    console.log(`🐞 [RenderAction] مرحله 8: رندر ویدیو با قالب ${template.name}...`);
    const videoPath = await VideoRenderer.renderTeaser({
      posts: postsWithLocalImages,
      plan,
    });

    // ۱۰. آپلود در Supabase
    console.log(`🐞 [RenderAction] مرحله 9: آپلود در Supabase...`);
    const videoUrl = await VideoStorage.uploadVideo(videoPath);

    // ۱۱. پاک کردن فایل‌های موقت تصاویر
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
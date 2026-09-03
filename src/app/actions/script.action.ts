'use server';

import { ScriptGeneratorService } from '@/lib/instagram/services/script-generator.service';
import { InstagramProfileDataSchema } from '@/lib/instagram/schemas/instagram.schema';

export async function generateTeaserScript(profileData: any) {
  console.log(`🐞 [ScriptAction] شروع تولید فیلم‌نامه...`);

  try {
    // ۱. اعتبارسنجی داده‌های ورودی (از فاز ۱)
    console.log(`🐞 [ScriptAction] مرحله 1: اعتبارسنجی داده‌های پروفایل...`);
    const validatedProfile = InstagramProfileDataSchema.parse(profileData);
    console.log(`🐞 [ScriptAction] ✅ داده‌های پروفایل معتبر است.`);

    // ۲. تولید فیلم‌نامه
    console.log(`🐞 [ScriptAction] مرحله 2: فراخوانی ScriptGenerator...`);
    const generator = new ScriptGeneratorService();
    const script = await generator.generateScript(validatedProfile);

    console.log(`🐞 [ScriptAction] ✅ فیلم‌نامه با موفقیت تولید شد.`);
    return {
      success: true,
      data: script,
    };
  } catch (error) {
    console.error(`🐞 [ScriptAction] ❌ خطا:`, error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'خطای ناشناخته',
        code: 'SCRIPT_GENERATION_FAILED',
      },
    };
  }
}
import 'server-only'; // 🔒 تضمین می‌کند این فایل فقط در سرور اجرا شود

import { createClient } from '@supabase/supabase-js';

// =============================================
//  دریافت متغیرهای محیطی
// =============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================
//  اعتبارسنجی متغیرهای محیطی
// =============================================
if (!supabaseUrl) {
  throw new Error(
    '❌ متغیر محیطی NEXT_PUBLIC_SUPABASE_URL تعریف نشده است. لطفاً آن را در فایل .env.local تنظیم کنید.'
  );
}

if (!serviceRoleKey) {
  throw new Error(
    '❌ متغیر محیطی SUPABASE_SERVICE_ROLE_KEY تعریف نشده است. لطفاً آن را در فایل .env.local تنظیم کنید.'
  );
}

// =============================================
//  ساخت کلاینت ادمین با کلید Service Role
// =============================================
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,   // غیرفعال کردن ذخیره‌سازی سشن در سرور
    autoRefreshToken: false, // غیرفعال کردن تازه‌سازی خودکار توکن
  },
});

// =============================================
//  تابع کمکی برای بررسی دسترسی ادمین (اختیاری)
// =============================================
export async function checkAdminAccess() {
  try {
    const { data, error } = await supabaseAdmin
      .from('_dummy')
      .select('*')
      .limit(1);
    if (error) {
      console.error('❌ دسترسی ادمین به Supabase برقرار نشد:', error);
      return false;
    }
    console.log('✅ دسترسی ادمین به Supabase با موفقیت برقرار شد.');
    return true;
  } catch (err) {
    console.error('❌ خطا در بررسی دسترسی ادمین:', err);
    return false;
  }
}
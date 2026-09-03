import { createClient } from '@supabase/supabase-js';

// =============================================
//  دریافت متغیرهای محیطی
// =============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================
//  اعتبارسنجی متغیرهای محیطی (اختیاری اما توصیه می‌شود)
// =============================================
if (!supabaseUrl) {
  throw new Error(
    '❌ متغیر محیطی NEXT_PUBLIC_SUPABASE_URL تعریف نشده است. لطفاً آن را در فایل .env.local تنظیم کنید.'
  );
}

if (!supabaseKey) {
  throw new Error(
    '❌ متغیر محیطی SUPABASE_SERVICE_ROLE_KEY تعریف نشده است. لطفاً آن را در فایل .env.local تنظیم کنید.'
  );
}

// =============================================
//  ساخت کلاینت Supabase با کلید Service Role (فقط برای سرور)
// =============================================
export const supabase = createClient(supabaseUrl, supabaseKey);

// =============================================
//  تابع کمکی برای بررسی اتصال (اختیاری)
// =============================================
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('_dummy').select('*').limit(1);
    if (error) {
      console.error('❌ اتصال به Supabase برقرار نشد:', error);
      return false;
    }
    console.log('✅ اتصال به Supabase با موفقیت برقرار شد.');
    return true;
  } catch (err) {
    console.error('❌ خطا در بررسی اتصال به Supabase:', err);
    return false;
  }
};
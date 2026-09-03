const fs = require('fs');
const path = require('path');

const folders = [
  'src/app/actions',
  'src/app/api/instagram',
  'src/lib/instagram/types',
  'src/lib/instagram/schemas',
  'src/lib/instagram/providers',
  'src/lib/utils',
];

const files = [
  { path: 'src/lib/instagram/types/instagram.types.ts', content: '// Types will be added here' },
  { path: 'src/lib/instagram/schemas/instagram.schema.ts', content: '// Schemas will be added here' },
  { path: 'src/lib/instagram/providers/instagram.provider.ts', content: '// Provider interface will be added here' },
  { path: 'src/lib/instagram/providers/rapidapi.provider.ts', content: '// RapidAPI impl will be added here' },
  { path: 'src/lib/instagram/providers/mock.provider.ts', content: '// Mock impl will be added here' },
  { path: 'src/lib/instagram/factory.ts', content: '// Factory will be added here' },
  { path: 'src/lib/utils/errors.ts', content: '// Errors will be added here' },
  { path: 'src/app/actions/instagram.action.ts', content: '// Action will be added here' },
  { path: 'src/app/api/instagram/route.ts', content: '// API route will be added here' },
];

console.log('🛠️  شروع ساخت ساختار پوشه‌های پروژه...');

// ساخت پوشه‌ها
folders.forEach(folder => {
  const fullPath = path.join(process.cwd(), folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ پوشه ساخته شد: ${folder}`);
  } else {
    console.log(`⏳ پوشه از قبل وجود دارد: ${folder}`);
  }
});

// ساخت فایل‌های موقت (Placeholder)
files.forEach(file => {
  const fullPath = path.join(process.cwd(), file.path);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, file.content, 'utf8');
    console.log(`✅ فایل ساخته شد: ${file.path}`);
  } else {
    console.log(`⏳ فایل از قبل وجود دارد: ${file.path}`);
  }
});

console.log('🎉 ساختار پروژه با موفقیت ایجاد شد! حالا کدهای فاز ۱ را جایگزین فایل‌ها کنید.');
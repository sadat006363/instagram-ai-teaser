import { BrandProfile } from './brand-profile';

export interface Template {
  id: string;
  name: string;
  supportedCategories: string[];
  minPosts: number;
  defaultColorPalette: string[];
}

// فقط متادیتای قالب‌ها (بدون کامپوننت)
export const TEMPLATES: Template[] = [
  {
    id: 'luxury',
    name: 'لوکس',
    supportedCategories: ['fashion', 'beauty', 'service'],
    minPosts: 3,
    defaultColorPalette: ['#6366f1', '#8b5cf6', '#ec4899'],
  },
  {
    id: 'energetic',
    name: 'پرانرژی',
    supportedCategories: ['food', 'fashion', 'personal'],
    minPosts: 3,
    defaultColorPalette: ['#ec4899', '#f59e0b'],
  },
  {
    id: 'minimal',
    name: 'مینیمال',
    supportedCategories: ['education', 'service', 'personal'],
    minPosts: 3,
    defaultColorPalette: ['#6b7280', '#9ca3af'],
  },
];

export function selectTemplate(profile: BrandProfile, postsCount: number): Template {
  console.log(`🐞 [TemplateSelector] انتخاب قالب برای دسته‌ی ${profile.category}`);

  const eligible = TEMPLATES.filter(t => 
    t.supportedCategories.includes(profile.category) && 
    t.minPosts <= postsCount
  );

  if (eligible.length === 0) {
    console.log(`🐞 [TemplateSelector] ⚠️ هیچ قالب مناسبی یافت نشد، استفاده از پیش‌فرض`);
    return TEMPLATES[0];
  }

  let selected = eligible[0];
  if (profile.tone === 'luxury') {
    const luxury = eligible.find(t => t.id === 'luxury');
    if (luxury) selected = luxury;
  } else if (profile.visualEnergy === 'high') {
    const energetic = eligible.find(t => t.id === 'energetic');
    if (energetic) selected = energetic;
  }

  console.log(`🐞 [TemplateSelector] ✅ قالب انتخاب شده: ${selected.name}`);
  return selected;
}
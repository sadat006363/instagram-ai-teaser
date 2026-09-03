import { z } from 'zod';

// اسکیمای هر صحنه
export const SceneSchema = z.object({
  postIndex: z.number().int().min(0).max(5),
  duration: z.number().int().min(2).max(8),
  caption: z.string().min(1).max(100),
  animation: z.enum(['zoom-in', 'zoom-out', 'slide-up', 'fade']).default('fade'),
});

// اسکیمای اصلی فیلم‌نامه
export const ScriptSchema = z.object({
  hook: z.string().min(5).max(50),
  scenes: z.array(SceneSchema).min(3).max(5),
  cta: z.string().min(5).max(50),
  brandHandle: z.string().min(1).max(30),
  colorPalette: z.object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  audioMood: z.enum(['upbeat', 'luxury', 'minimal', 'dramatic']),
});

export type Script = z.infer<typeof ScriptSchema>;
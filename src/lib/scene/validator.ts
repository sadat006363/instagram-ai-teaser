import { ScenePlan } from './scene-plan';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * اعتبارسنجی سناریو قبل از رندر
 */
export function validateScenePlan(plan: ScenePlan): ValidationResult {
  const errors: string[] = [];

  // ۱. حداقل ۳ صحنه
  if (plan.scenes.length < 3) {
    errors.push('حداقل ۳ صحنه نیاز است');
  }

  // ۲. مدت هر صحنه (حداقل ۱۲ فریم برای ۳۰fps = 0.4 ثانیه)
  plan.scenes.forEach((scene, i) => {
    if (scene.duration < 0.4) {
      errors.push(`صحنه ${i+1}: مدت زمان کمتر از ۰.۴ ثانیه است`);
    }
    if (scene.text.length > 60) {
      errors.push(`صحنه ${i+1}: متن بیش از ۶۰ کاراکتر است`);
    }
    if (!scene.text.trim()) {
      errors.push(`صحنه ${i+1}: متن خالی است`);
    }
  });

  // ۳. وجود CTA
  const hasCTA = plan.scenes.some(s => s.type === 'cta');
  if (!hasCTA) {
    errors.push('هیچ CTA (دعوت به اقدام) در سناریو وجود ندارد');
  }

  // ۴. وجود هوک
  const hasHook = plan.scenes.some(s => s.type === 'hook');
  if (!hasHook) {
    errors.push('هیچ هوک (Hook) در سناریو وجود ندارد');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
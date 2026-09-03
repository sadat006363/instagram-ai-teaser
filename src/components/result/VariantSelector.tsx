'use client';

import { Check } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  style: string;
  duration: string;
  resolution: string;
  mood: string;
  recommended?: boolean;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const VariantSelector = ({
  variants,
  selectedId,
  onSelect,
}: VariantSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => onSelect(variant.id)}
          className={`
            relative p-4 rounded-xl border-2 text-left transition-all duration-200
            ${
              selectedId === variant.id
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-500 bg-gray-800/30'
            }
          `}
        >
          {variant.recommended && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              پیشنهادی
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{variant.name}</span>
                {selectedId === variant.id && (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                <div>{variant.duration} · {variant.resolution}</div>
                <div>{variant.mood}</div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
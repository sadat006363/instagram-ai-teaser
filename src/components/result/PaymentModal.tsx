'use client';

import { X, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
}

export const PaymentModal = ({ isOpen, onClose, onPayment }: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold">حذف واترمارک</h2>
          <p className="text-gray-400 mt-2">
            ویدیوی خود را بدون واترمارک و با کیفیت بالاتر دریافت کنید
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
            <span className="text-gray-300">کیفیت</span>
            <span className="font-medium">Full HD · 1080x1920</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
            <span className="text-gray-300">واترمارک</span>
            <span className="text-green-400 font-medium">✓ حذف شده</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
            <span className="text-gray-300">قیمت</span>
            <span className="text-2xl font-bold text-indigo-400">۵ دلار</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={onPayment} icon={CreditCard} className="w-full">
            پرداخت و دریافت ویدیو
          </Button>
          <p className="text-center text-xs text-gray-500">
            پرداخت امن از طریق Stripe · ضمانت بازگشت وجه
          </p>
        </div>
      </Card>
    </div>
  );
};
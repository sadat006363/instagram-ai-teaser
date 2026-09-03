export class InstagramScraperError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'InstagramScraperError';
  }
}

export class InstagramPrivateAccountError extends InstagramScraperError {
  constructor(username: string) {
    super(`❌ حساب کاربری ${username} خصوصی است و قابل دسترسی نیست.`, 'PRIVATE_ACCOUNT');
  }
}

export class InstagramNotFoundError extends InstagramScraperError {
  constructor(username: string) {
    super(`❌ کاربری با نام ${username} یافت نشد.`, 'NOT_FOUND');
  }
}

export class InstagramRateLimitError extends InstagramScraperError {
  constructor() {
    super('❌ محدودیت درخواست‌ها (Rate Limit) رسیده است. لطفاً چند دقیقه بعد تلاش کنید.', 'RATE_LIMIT');
  }
}// Errors will be added here
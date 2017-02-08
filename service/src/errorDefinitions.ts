export type ErrorCode =
  'TopupExceedsMaxBalance' |
  'TooManyPurchaseItems' |
  'EmailNotFound' |
  'UnknownError';

export const humanErrorStrings = {
  TopupExceedsMaxBalance: 'Topping up would exceed the maximum balance',
  TooManyPurchaseItems: 'Purchase quantity is too large',
  EmailNotFound: 'Email not found'
};

export class UserError extends Error {
  public code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

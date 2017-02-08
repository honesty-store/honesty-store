export type ErrorCode =
  'TopupExceedsMaxBalance' |
  'TooManyPurchaseItems' |
  'UnknownError';

export class UserError extends Error {
  public code: number;

  constructor(code: ErrorCode, message) {
    super(message);
    this.code = code;
  }
}

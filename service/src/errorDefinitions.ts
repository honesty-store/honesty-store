// this is duplicated in javascript @ web/src/chrome/errors.js

export type ErrorCode =
  'TopupExceedsMaxBalance' |
  'TooManyPurchaseItems' |
  'EmailNotFound' |
  'NoCardDetailsPresent' |
  'CardProviderError' |
  'CardInvalidCCNumber' |
  'CardInvalidExpiryMonth' |
  'CardInvalidExpiryYear' |
  'CardInvalidCVC' |
  'CardExpired' |
  'CardInvalidSecurityCode' |
  'CardDeclined' |
  'CardErrorGeneric' |
  'UnknownError';

export class UserError extends Error {
  public code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

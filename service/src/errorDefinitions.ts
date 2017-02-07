export const TOPUP_EXCEEDS_MAX_BALANCE = 'TOPUP_EXCEEDS_MAX_BALANCE';
export const TOO_MANY_PURCHASE_ITEMS = 'TOO_MANY_PURCHASE_ITEMS';

export type UserErrorCode = TOPUP_EXCEEDS_MAX_BALANCE | TOO_MANY_PURCHASE_ITEMS;

export class UserError extends Error {
  public userErrorCode: number;

  constructor(userErrorCode: UserErrorCode, message) {
    super(message);
    this.userErrorCode = userErrorCode;
  }
}

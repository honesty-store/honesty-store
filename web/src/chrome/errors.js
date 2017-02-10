// this is duplicated in typescript @ service/src/errorDefinitions.ts

export const errorDefinitions = {
  TopupExceedsMaxBalance: { message: 'Topping up would exceed your maximum balance', retryable: false },
  TooManyPurchaseItems: { message: "You're purchasing too many items", retryable: false },
  EmailNotFound: { message: "Couldn't find your email", retryable: true }, // this should be handled transparently
  NoCardDetailsPresent: { message: 'We have no card details for you', retryable: true }, // this should be handled transparently
  CardIncorrectNumber: { message: 'Incorrect card number', retryable: true },
  CardInvalidNumber: { message: 'Invalid card number', retryable: true },
  CardInvalidExpiryMonth: { message: 'Invalid expiry month', retryable: true },
  CardInvalidExpiryYear: { message: 'Invalid expiry year', retryable: true },
  CardIncorrectCVC: { message: 'Incorrect CVC', retryable: true },
  CardInvalidCVC: { message: 'Invalid CVC', retryable: true },
  CardExpired: { message: 'Card expired', retryable: true },
  CardDeclined: { message: 'Card declined', retryable: true },
  CardError: { message: 'Hit a problem with your card details', retryable: true }
};

export const codeIsCardProviderError = code => code.startsWith('Card');

export const paramFromCardProviderError = ({ code }) => {
  switch (code) {
    case 'CardIncorrectNumber':
    case 'CardInvalidNumber':
      return 'number';

    case 'CardInvalidExpiryMonth':
    case 'CardInvalidExpiryYear':
    case 'CardExpired':
      return 'exp';

    case 'CardIncorrectCVC':
    case 'CardInvalidCVC':
      return 'cvc';

    case 'CardDeclined':
    case 'CardError':
    default:
      return '';
  }
};

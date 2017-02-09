// this is duplicated in typescript @ service/src/errorDefinitions.ts

const cardErrorString = 'Hit a problem with your card details';

export const errorDefinitions = {
  TopupExceedsMaxBalance: { message: 'Topping up would exceed your maximum balance', retryable: false },
  TooManyPurchaseItems: { message: "You're purchasing too many items", retryable: false },
  EmailNotFound: { message: "Couldn't find your email", retryable: true }, // this should be handled transparently
  NoCardDetailsPresent: { message: 'We have no card details for you', retryable: true }, // this should be handled transparently
  CardIncorrectNumber: { message: cardErrorString, retryable: true },
  CardInvalidNumber: { message: cardErrorString, retryable: true },
  CardInvalidExpiryMonth: { message: cardErrorString, retryable: true },
  CardInvalidExpiryYear: { message: cardErrorString, retryable: true },
  CardIncorrectCVC: { message: cardErrorString, retryable: true },
  CardInvalidCVC: { message: cardErrorString, retryable: true },
  CardExpired: { message: cardErrorString, retryable: true },
  CardDeclined: { message: cardErrorString, retryable: true },
  CardError: { message: cardErrorString, retryable: true }
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

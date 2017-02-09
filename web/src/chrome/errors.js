// this is duplicated in typescript @ service/src/errorDefinitions.ts

const cardErrorString = 'Hit a problem with your card details';

export const errorDefinitions = {
  TopupExceedsMaxBalance: { humanReadableString: 'Topping up would exceed your maximum balance', retryable: false },
  TooManyPurchaseItems: { humanReadableString: 'You\'re purchasing too many items', retryable: false },
  EmailNotFound: { humanReadableString: 'Couldn\'t find your email', retryable: true }, // this should be handled transparently and never been seen
  CardProviderError: { humanReadableString: cardErrorString, retryable: true },
  CardInvalidCCNumber: { humanReadableString: cardErrorString, retryable: true },
  CardInvalidExpiryMonth: { humanReadableString: cardErrorString, retryable: true },
  CardInvalidExpiryYear: { humanReadableString: cardErrorString, retryable: true },
  CardInvalidCVC: { humanReadableString: cardErrorString, retryable: true },
  CardExpired: { humanReadableString: cardErrorString, retryable: true },
  CardInvalidSecurityCode: { humanReadableString: cardErrorString, retryable: true },
  CardDeclined: { humanReadableString: cardErrorString, retryable: true },
  CardErrorGeneric: { humanReadableString: cardErrorString, retryable: true }
};

export const codeIsCardProviderError = code => code.startsWith('Card');

export const paramFromCardProviderError = ({ code }) => {
  switch (code) {
    case 'CardProviderError':
    case 'CardInvalidSecurityCode':
    case 'CardDeclined':
    case 'CardErrorGeneric':
    default:
      return '';

    case 'CardInvalidCCNumber':
      return 'number';

    case 'CardInvalidExpiryMonth':
    case 'CardInvalidExpiryYear':
    case 'CardExpired':
      return 'exp';

    case 'CardInvalidCVC':
      return 'cvc';
  }
};

// this is duplicated in typescript @ service/src/errorDefinitions.ts

export default {
  TopupExceedsMaxBalance: { humanReadable: 'Topping up would exceed the maximum balance', retryable: false },
  TooManyPurchaseItems: { humanReadable: 'Purchase quantity is too large', retryable: false },
  EmailNotFound: { humanReadable: 'Email not found', retryable: true }
};

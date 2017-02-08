// this is duplicated in typescript @ service/src/errorDefinitions.ts

export default {
  TopupExceedsMaxBalance: { humanReadable: 'Topping up would exceed your maximum balance', retryable: false },
  TooManyPurchaseItems: { humanReadable: 'You\'re purchasing too many items', retryable: false },
  EmailNotFound: { humanReadable: 'Couldn\'t find your email', retryable: true } // this should be handled transparently and never been seen
};

import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');

export interface Key {
  __IS__A__KEY__: void;

  service: string;
  correlationKey: string;
  tags: {
      // specific to the key, e.g. userId, email, etc
  };
}

export interface AuthenticationKey extends Key {
  setUserId(userId: string);
}

const createKey = ({ service, correlationKey = uuid(), tags = {} }) => {
  return <Key>{
    __IS__A__KEY__: void 0,
    service,
    correlationKey,
    tags
  };
};

export const createUserKey = ({ userId, correlationKey = undefined }) => {
  if (!isUUID(userId)) {
    throw new Error(`Invalid userId specified ${userId}`);
  }
  return createKey({
    service: 'user',
    correlationKey,
    tags: { userId }
  });
};

export const createAuthenticationKey = () => {
  const correlationKey = uuid();
  const key = createKey({
    service: 'auth'
  });

  return <AuthenticationKey>{
    ...key,

    setUserId(userId: string): Key {
      return createUserKey({ userId, correlationKey });
    }
  };
};

export const createEmailKey = ({ emailAddress }) => {
  if (!isEmail(emailAddress)) {
    throw new Error(`Invalid emailAddress specified ${emailAddress}`);
  }
  return createKey({
    service: 'email',
    tags: { emailAddress }
  });
};

export const createServiceKey = ({ service }) => {
  return createKey({ service });
};

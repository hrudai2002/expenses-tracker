import { ensureObject, requireEmail, requireString } from './common.validator.js';

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

function validateSignupPayload(payload: unknown): SignupPayload {
  const data = ensureObject(payload);

  return {
    name: requireString(data.name, 'name', { minLength: 2 }),
    email: requireEmail(data.email),
    password: requireString(data.password, 'password', { minLength: 8 })
  };
}

function validateLoginPayload(payload: unknown): LoginPayload {
  const data = ensureObject(payload);

  return {
    email: requireEmail(data.email),
    password: requireString(data.password, 'password', { minLength: 8 })
  };
}

export { validateLoginPayload, validateSignupPayload };


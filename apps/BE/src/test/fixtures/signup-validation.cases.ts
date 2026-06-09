import { FIXTURE_USER_PASSWORD } from '@quack/mongoose/fixtures';
import type { Signup } from '@shared/dtos';

type SignupField = keyof Signup;

export type SignupValidationCase = readonly [
  label: string,
  body: Partial<Record<SignupField, unknown>>,
  message: string,
];

export const SIGNUP_VALIDATION_CASES = [
  [
    'missing email',
    { name: 'New User', password: FIXTURE_USER_PASSWORD },
    'A valid email is required',
  ],
  [
    'missing name',
    { email: 'new@example.com', password: FIXTURE_USER_PASSWORD },
    'Name is required',
  ],
  [
    'missing password',
    { email: 'new@example.com', name: 'New User' },
    'Password is required',
  ],
  [
    'invalid email',
    {
      email: 'not-an-email',
      name: 'Bad Email',
      password: FIXTURE_USER_PASSWORD,
    },
    'A valid email is required',
  ],
  [
    'name shorter than 3 characters',
    {
      email: 'new@example.com',
      name: 'Ab',
      password: FIXTURE_USER_PASSWORD,
    },
    'Name must be at least 3 characters',
  ],
  [
    'name shorter than 3 characters after HTML is stripped',
    {
      email: 'new@example.com',
      name: 'ab<script>x</script>',
      password: FIXTURE_USER_PASSWORD,
    },
    'Name must be at least 3 characters',
  ],
  [
    'password shorter than 8 characters',
    { email: 'new@example.com', name: 'New User', password: 'Pass1!' },
    'Password must be at least 8 characters',
  ],
  [
    'password without a letter',
    { email: 'new@example.com', name: 'New User', password: '12345678!' },
    'Password must contain at least one letter',
  ],
  [
    'password without a number',
    { email: 'new@example.com', name: 'New User', password: 'Password!!' },
    'Password must contain at least one number',
  ],
  [
    'password without a special character',
    { email: 'new@example.com', name: 'New User', password: 'Password1' },
    'Password must contain at least one special character',
  ],
] as const satisfies readonly SignupValidationCase[];

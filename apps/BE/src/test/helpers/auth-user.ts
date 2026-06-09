/** Assert API user payload matches {@link AuthUser} — no secrets or refresh metadata. */
export function expectAuthUserShape(
  user: Record<string, unknown>,
  expected?: Partial<Record<'_id' | 'email' | 'name', string>>,
): void {
  expect(user).toEqual(
    expect.objectContaining({
      _id: expect.any(String),
      email: expect.any(String),
      name: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      ...expected,
    }),
  );
  expect(user).not.toHaveProperty('password');
  expect(user).not.toHaveProperty('refreshTokenHash');
  expect(user).not.toHaveProperty('refreshTokenRotatedAt');
}

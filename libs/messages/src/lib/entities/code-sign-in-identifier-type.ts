export const CodeSignInIdentifierType = {
  user: 'user',
  customerCard: 'customer-card',
} as const;
export type CodeSignInIdentifierType = typeof CodeSignInIdentifierType[keyof typeof CodeSignInIdentifierType];

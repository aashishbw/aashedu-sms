export function hash(password: string, salt?: string): string;
export function verify(password: string, encoded: string): boolean;

declare module 'bcryptjs' {
  export function hash(
    data: string | Buffer,
    saltOrRounds: string | number
  ): Promise<string>;

  export function hashSync(
    data: string | Buffer,
    saltOrRounds: string | number
  ): string;

  export function compare(
    data: string | Buffer,
    encrypted: string
  ): Promise<boolean>;

  export function compareSync(
    data: string | Buffer,
    encrypted: string
  ): boolean;

  export function genSalt(
    rounds: number,
    callback: (err: Error | null, salt: string) => void
  ): void;

  export function genSaltSync(rounds?: number): string;

  export function getRounds(encrypted: string): number;

  export function getSalt(encrypted: string): string;

  export interface Rounds {
    rounds: number;
  }

  export const ROUNDS: Rounds;
}

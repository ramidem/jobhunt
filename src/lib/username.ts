// Mirrors the rules enforced in the database (supabase/migrations/*_profiles_and_usernames.sql).
// The database stays the authority; this only gives instant feedback while typing.
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const USERNAME_HINT = "3 to 30 characters: lowercase letters, numbers and single hyphens.";

const USERNAME_PATTERN = /^[a-z0-9]([a-z0-9]|-(?!-))*[a-z0-9]$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string) {
  return value.length >= USERNAME_MIN && value.length <= USERNAME_MAX && USERNAME_PATTERN.test(value);
}

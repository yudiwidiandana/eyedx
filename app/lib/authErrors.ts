import { translations, type Locale } from "./translations";

type AuthText = (typeof translations)[Locale]["authPage"];

// pesan Inggris dari /api/auth dipetakan ke kunci terjemahan, pesan tak dikenal tampil apa adanya
const SERVER_MESSAGE_KEYS = {
  "Invalid credentials": "errorInvalidCredentials",
  "Username already exists": "errorUsernameTaken",
  "Missing required fields": "errorMissingFields",
  "Invalid gender": "errorInvalidGender",
  "Failed to create user": "errorCreateFailed",
} as const;

export function localizeAuthError(message: string, t: AuthText): string {
  if (!Object.hasOwn(SERVER_MESSAGE_KEYS, message)) return message;
  return t[SERVER_MESSAGE_KEYS[message as keyof typeof SERVER_MESSAGE_KEYS]];
}

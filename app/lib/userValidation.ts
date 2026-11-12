export const MIN_PASSWORD_LENGTH = 8;
export const ALLOWED_GENDERS = ["laki-laki", "perempuan", "lainnya"];
export const ALLOWED_ROLES = ["user", "expert", "admin"] as const;

export type UserRole = (typeof ALLOWED_ROLES)[number];

export interface NewUserInput {
  username?: unknown;
  name?: unknown;
  age?: unknown;
  gender?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

// mengembalikan pesan error, atau null bila semua valid
export function validateNewUser(data: NewUserInput): string | null {
  // age dicek terpisah supaya angka 0 tidak dianggap field kosong
  const hasAge = data.age !== undefined && data.age !== null && data.age !== "";
  if (!data.username || !data.password || !data.name || !hasAge || !data.gender) {
    return "Missing required fields";
  }

  if (data.password !== data.confirmPassword) {
    return "Password confirmation does not match";
  }

  if (String(data.password).length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  const parsedAge = Number(data.age);
  if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 150) {
    return "Invalid age";
  }

  if (!ALLOWED_GENDERS.includes(data.gender as string)) {
    return "Invalid gender";
  }

  return null;
}

export function isValidRole(role: unknown): role is UserRole {
  return ALLOWED_ROLES.includes(role as UserRole);
}

export interface UserUpdateInput {
  name?: unknown;
  age?: unknown;
  gender?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

// semua field opsional - hanya yang dikirim yang divalidasi dan diubah
export function validateUserUpdate(data: UserUpdateInput): string | null {
  if (data.name !== undefined && !String(data.name).trim()) {
    return "Name cannot be empty";
  }

  if (data.age !== undefined) {
    const parsedAge = Number(data.age);
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 150) {
      return "Invalid age";
    }
  }

  if (data.gender !== undefined && !ALLOWED_GENDERS.includes(data.gender as string)) {
    return "Invalid gender";
  }

  if (data.password !== undefined && data.password !== "") {
    if (data.password !== data.confirmPassword) {
      return "Password confirmation does not match";
    }
    if (String(data.password).length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
  }

  return null;
}

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createUser, getUserByUsername } from "./db";
import { signToken, verifyToken } from "./jwt";

export { signToken, verifyToken };

// dipakai di server component (bukan API route) untuk baca sesi dari cookie httpOnly
export async function getSessionUser(): Promise<{ sub: string; role: string } | null> {
  const token = (await cookies()).get("next-auth.session-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(data: {
  username: string;
  name: string;
  age: number;
  gender: string;
  password: string;
}): Promise<string> {
  const existingUser = await getUserByUsername(data.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const passwordHash = await hashPassword(data.password);
  await createUser({
    username: data.username,
    name: data.name,
    age: data.age,
    gender: data.gender,
    passwordHash,
    role: "user",
  });
  const user = await getUserByUsername(data.username);

  if (!user) {
    throw new Error("Failed to create user");
  }

  return signToken({ sub: user.id, role: user.role });
}

export async function loginUser(
  username: string,
  password: string
): Promise<string> {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return signToken({ sub: user.id, role: user.role });
}

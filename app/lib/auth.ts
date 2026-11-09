import bcrypt from "bcryptjs";
import { createUser, getUserByUsername } from "./db";
import { signToken, verifyToken } from "./jwt";

export { signToken, verifyToken };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(
  username: string,
  name: string,
  password: string
): Promise<string> {
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const passwordHash = await hashPassword(password);
  await createUser(username, name, passwordHash, "user");
  const user = await getUserByUsername(username);

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

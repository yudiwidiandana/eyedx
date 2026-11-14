import { SignJWT, jwtVerify } from "jose";

// di production secret wajib ada; nilai bawaan hanya untuk dev dan test
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET wajib diisi di production (lihat .env.example)");
  }
  return new TextEncoder().encode(secret || "eyedx-secret-key-change-in-production");
}

export async function signToken(payload: {
  sub: string;
  role: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(
  token: string
): Promise<{ sub: string; role: string } | null> {
  // di luar try supaya salah konfigurasi tidak tampak seperti token tidak valid
  const secret = getSecret();

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

import { describe, it, expect } from "vitest";
import { localizeAuthError } from "./authErrors";
import { translations } from "./translations";

const en = translations.en.authPage;
const id = translations.id.authPage;

describe("localizeAuthError", () => {
  it("menerjemahkan pesan dikenal ke bahasa Indonesia", () => {
    expect(localizeAuthError("Invalid credentials", id)).toBe("Username atau kata sandi salah");
    expect(localizeAuthError("Username already exists", id)).toBe("Username sudah dipakai");
    expect(localizeAuthError("Missing required fields", id)).toBe(id.errorMissingFields);
    expect(localizeAuthError("Invalid gender", id)).toBe(id.errorInvalidGender);
    expect(localizeAuthError("Failed to create user", id)).toBe(id.errorCreateFailed);
  });

  it("menerjemahkan pesan dikenal ke bahasa Inggris", () => {
    expect(localizeAuthError("Invalid credentials", en)).toBe("Incorrect username or password");
    expect(localizeAuthError("Username already exists", en)).toBe("Username is already taken");
  });

  it("pesan tak dikenal tampil apa adanya", () => {
    expect(localizeAuthError("Sesuatu yang aneh", id)).toBe("Sesuatu yang aneh");
    expect(localizeAuthError("toString", id)).toBe("toString");
  });
});

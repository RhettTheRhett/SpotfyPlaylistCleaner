import crypto from "crypto";

export function generateCodeVerifier() {
  return crypto.randomBytes(64).toString("hex");
}

export function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
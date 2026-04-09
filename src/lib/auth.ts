import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "default-secret-key-123";

/**
 * BUG 7: Verifies webhook signature using === instead of crypto.timingSafeEqual.
 * This is vulnerable to timing attacks where an attacker can determine the
 * correct signature byte-by-byte by measuring response times.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  // BUG: Using === instead of crypto.timingSafeEqual
  // This allows timing attacks to guess the signature byte by byte
  return signature === expected;
}

/**
 * Secure version (for reference — not used by the app).
 */
export function verifyWebhookSignatureSecure(
  payload: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

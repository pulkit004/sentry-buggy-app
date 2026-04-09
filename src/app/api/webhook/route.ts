import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/auth";

/**
 * BUG 7: Timing attack in signature verification.
 *
 * The verifyWebhookSignature function in src/lib/auth.ts uses ===
 * instead of crypto.timingSafeEqual. This leaks timing information
 * that attackers can use to determine the correct signature byte-by-byte.
 *
 * Additionally, this route returns different error messages for
 * "missing signature" vs "invalid signature", which is an information leak.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-webhook-signature");

  // BUG: Different error messages leak information about what's wrong
  if (!signature) {
    return NextResponse.json(
      { error: "Missing x-webhook-signature header" },
      { status: 401 },
    );
  }

  const body = await request.text();

  // BUG: Uses === comparison (timing attack vulnerable)
  const valid = verifyWebhookSignature(body, signature);

  if (!valid) {
    // BUG: Reveals that the signature format was correct but value was wrong
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  // Process the webhook payload
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    received: true,
    processed: true,
    timestamp: new Date().toISOString(),
  });
}

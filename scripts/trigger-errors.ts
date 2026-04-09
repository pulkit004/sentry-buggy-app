/**
 * Trigger script — hits each buggy route multiple times to generate
 * Sentry issues with enough events (need count >= 3 to pass Gate 0).
 *
 * Usage: npx tsx scripts/trigger-errors.ts
 * Requires the Next.js dev server to be running on http://localhost:3000
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const HITS_PER_BUG = 5;

async function hit(url: string, options?: RequestInit): Promise<void> {
  try {
    const res = await fetch(url, options);
    const status = res.status;
    const text = await res.text().catch(() => "");
    console.log(`  ${status} ${url} ${text.slice(0, 80)}`);
  } catch (err) {
    console.log(`  ERR ${url}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`\nSentry Buggy App — Error Trigger Script`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Hits per bug: ${HITS_PER_BUG}\n`);

  // Verify server is running
  try {
    await fetch(`${BASE_URL}/`);
  } catch {
    console.error(`ERROR: Server not reachable at ${BASE_URL}`);
    console.error(`Start the dev server first: npm run dev`);
    process.exit(1);
  }

  // Bug 1: TypeError — .map() on undefined in RSC
  console.log("Bug 1: TypeError (.map on undefined) — /dashboard");
  for (let i = 0; i < HITS_PER_BUG; i++) {
    await hit(`${BASE_URL}/dashboard`);
    await sleep(200);
  }

  // Bug 2: Race condition — rapidly switch filters
  console.log("\nBug 2: Race condition (stale closure) — /users");
  for (let i = 0; i < HITS_PER_BUG; i++) {
    // Rapidly fire requests with different filters to trigger race
    await Promise.all([
      hit(`${BASE_URL}/api/users?role=admin`),
      hit(`${BASE_URL}/api/users?role=user`),
      hit(`${BASE_URL}/api/users?role=moderator`),
    ]);
    await sleep(100);
  }
  // Hit the page itself to trigger client-side errors
  for (let i = 0; i < HITS_PER_BUG; i++) {
    await hit(`${BASE_URL}/users`);
    await sleep(200);
  }

  // Bug 3: Unhandled error in generateMetadata — non-existent user IDs
  console.log("\nBug 3: Unhandled metadata error — /users/[id]");
  const fakeIds = [999, 0, -1, 42, 1000];
  for (const id of fakeIds) {
    await hit(`${BASE_URL}/users/${id}`);
    await sleep(200);
  }

  // Bug 4: Memory leak — hit orders with many unique query combos
  console.log("\nBug 4: Memory leak (unbounded cache) — /orders");
  const sorts = ["id", "amount", "status"];
  const queries = ["widget", "gadget", "", "premium", "sale"];
  for (let page = 1; page <= HITS_PER_BUG; page++) {
    for (const sort of sorts) {
      const q = queries[page % queries.length];
      await hit(`${BASE_URL}/orders?page=${page}&sort=${sort}&q=${q}`);
    }
    await sleep(100);
  }

  // Bug 5: XSS — just load the page (XSS fires client-side)
  console.log("\nBug 5: XSS (dangerouslySetInnerHTML) — /analytics");
  for (let i = 0; i < HITS_PER_BUG; i++) {
    await hit(`${BASE_URL}/analytics`);
    await sleep(200);
  }

  // Bug 6: SQL injection — inject malicious payloads
  console.log("\nBug 6: SQL injection — /api/users?name=...");
  const injections = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM passwords --",
    "admin'/*",
    "Robert'; DROP TABLE students;--",
  ];
  for (const payload of injections) {
    await hit(`${BASE_URL}/api/users?name=${encodeURIComponent(payload)}`);
    await sleep(200);
  }

  // Bug 7: Timing attack — send invalid webhook signatures
  console.log("\nBug 7: Timing attack — /api/webhook");
  const payloads = [
    { event: "user.created", userId: 1 },
    { event: "order.placed", orderId: 101 },
    { event: "payment.received", amount: 49.99 },
    { event: "user.deleted", userId: 2 },
    { event: "session.expired", sessionId: "abc" },
  ];
  for (const payload of payloads) {
    const body = JSON.stringify(payload);
    // Send with missing signature
    await hit(`${BASE_URL}/api/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    // Send with wrong signature
    await hit(`${BASE_URL}/api/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-signature": "invalid-signature-" + Math.random().toString(36),
      },
      body,
    });
    await sleep(100);
  }

  console.log("\n--- Done ---");
  console.log("Wait ~30 seconds for Sentry to ingest events.");
  console.log("Check your Sentry dashboard for new issues.\n");
}

main().catch(console.error);

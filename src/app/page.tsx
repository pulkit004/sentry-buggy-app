export default function Home() {
  return (
    <main>
      <h1>Sentry Buggy App</h1>
      <p>A deliberately buggy Next.js app for testing the sentry-agent pipeline.</p>
      <h2>Bug Routes</h2>
      <ul>
        <li><a href="/dashboard">/dashboard</a> — Bug 1: TypeError (.map on undefined)</li>
        <li><a href="/users">/users</a> — Bug 2: Race condition (stale closure)</li>
        <li><a href="/users/999">/users/999</a> — Bug 3: Unhandled error in generateMetadata</li>
        <li><a href="/orders">/orders</a> — Bug 4: Memory leak (unbounded cache)</li>
        <li><a href="/analytics">/analytics</a> — Bug 5: XSS via dangerouslySetInnerHTML</li>
        <li><code>POST /api/users?name=...</code> — Bug 6: SQL injection</li>
        <li><code>POST /api/webhook</code> — Bug 7: Timing attack</li>
      </ul>
    </main>
  );
}

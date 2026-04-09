/**
 * BUG 1: TypeError — calling .map() on undefined.
 *
 * This Server Component fetches user data where the `users` field
 * can be undefined (e.g., when the API returns partial data).
 * Calling .map() on undefined throws a TypeError.
 */

interface DashboardData {
  title: string;
  users?: Array<{ id: number; name: string }>;
}

async function fetchDashboardData(): Promise<DashboardData> {
  // Simulate an API that sometimes returns data without the users field
  if (Math.random() < 0.7) {
    return { title: "Dashboard" };
  }
  return {
    title: "Dashboard",
    users: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ],
  };
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  // BUG: data.users can be undefined — this will throw TypeError
  const userNames = data.users.map((u) => u.name);

  return (
    <main>
      <h1>{data.title}</h1>
      <h2>Active Users</h2>
      <ul>
        {userNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </main>
  );
}

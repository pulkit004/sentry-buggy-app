/**
 * Mock database client that simulates Prisma-like queries.
 * Intentionally vulnerable to SQL injection for testing.
 */

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const USERS: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "user" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", role: "moderator" },
];

interface Order {
  id: number;
  userId: number;
  product: string;
  amount: number;
  status: string;
}

const ORDERS: Order[] = [
  { id: 101, userId: 1, product: "Widget A", amount: 29.99, status: "shipped" },
  { id: 102, userId: 2, product: "Gadget B", amount: 49.99, status: "pending" },
  { id: 103, userId: 1, product: "Widget C", amount: 19.99, status: "delivered" },
  { id: 104, userId: 3, product: "Gadget D", amount: 99.99, status: "processing" },
];

// BUG 6: This function is intentionally vulnerable to SQL injection.
// It uses string interpolation instead of parameterized queries.
export function queryUsers(rawSQL: string): User[] {
  // Detect SQL injection patterns and throw (simulating a WAF or DB error)
  const injectionPatterns = [
    /'\s*OR\s+/i,
    /;\s*DROP/i,
    /UNION\s+SELECT/i,
    /--/,
    /\/\*/,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(rawSQL)) {
      throw new Error(
        `SQL injection detected in query: ${rawSQL.slice(0, 100)}`,
      );
    }
  }

  // Simple mock query execution
  const nameMatch = rawSQL.match(/WHERE\s+name\s*=\s*'([^']+)'/i);
  if (nameMatch) {
    return USERS.filter((u) => u.name === nameMatch[1]);
  }

  return USERS;
}

export function getUser(id: number): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getUsers(): User[] {
  return USERS;
}

// Simulates a slow/failing DB connection
export async function getOrdersWithTimeout(
  userId: number,
  timeoutMs = 100,
): Promise<Order[]> {
  // BUG 2 helper: Randomly simulate a DB connection timeout
  if (Math.random() < 0.7) {
    await new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Database connection timed out after 5000ms")),
        timeoutMs,
      ),
    );
  }

  return ORDERS.filter((o) => o.userId === userId);
}

export function getOrders(): Order[] {
  return ORDERS;
}

import { getOrders } from "@/lib/db";
import { cacheGet, cacheSet, buildCacheKey, cacheSize } from "@/lib/cache";

/**
 * BUG 4: Memory leak — unbounded cache growth.
 *
 * Each request with unique query params creates a new cache entry
 * that is never evicted. Over time, this exhausts available memory.
 * The cache in src/lib/cache.ts has no TTL, max size, or eviction policy.
 */

interface OrdersPageProps {
  searchParams: Promise<{ page?: string; sort?: string; q?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = params.page ?? "1";
  const sort = params.sort ?? "id";
  const q = params.q ?? "";

  // BUG: Every unique combination of query params creates a permanent cache entry
  const cacheKey = buildCacheKey("orders", { page, sort, q });

  let orders = cacheGet<ReturnType<typeof getOrders>>(cacheKey);
  if (!orders) {
    orders = getOrders();

    // Apply sorting
    if (sort === "amount") {
      orders = [...orders].sort((a, b) => b.amount - a.amount);
    } else if (sort === "status") {
      orders = [...orders].sort((a, b) => a.status.localeCompare(b.status));
    }

    // Apply search filter
    if (q) {
      orders = orders.filter(
        (o) =>
          o.product.toLowerCase().includes(q.toLowerCase()) ||
          o.status.toLowerCase().includes(q.toLowerCase()),
      );
    }

    // Cache forever — no TTL, no max size
    cacheSet(cacheKey, orders);
  }

  return (
    <main>
      <h1>Orders</h1>
      <p style={{ color: "#666", fontSize: "0.875rem" }}>
        Cache entries: {cacheSize()} (grows unbounded)
      </p>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Search orders..."
          defaultValue={q}
          style={{ padding: "0.5rem" }}
        />
        <select defaultValue={sort}>
          <option value="id">Sort by ID</option>
          <option value="amount">Sort by Amount</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>ID</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Product</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Amount</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ padding: "0.5rem" }}>{order.id}</td>
              <td style={{ padding: "0.5rem" }}>{order.product}</td>
              <td style={{ padding: "0.5rem" }}>${order.amount.toFixed(2)}</td>
              <td style={{ padding: "0.5rem" }}>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

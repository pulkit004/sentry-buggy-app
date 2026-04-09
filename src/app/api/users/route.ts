import { NextRequest, NextResponse } from "next/server";
import { queryUsers, getUsers } from "@/lib/db";

/**
 * BUG 6: SQL injection via string interpolation.
 *
 * The `name` query parameter is interpolated directly into a SQL string
 * instead of using parameterized queries. The mock DB detects injection
 * patterns and throws, but in a real DB this would be exploitable.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const role = searchParams.get("role");

  // If filtering by name, use the vulnerable query function
  if (name) {
    // BUG: String interpolation instead of parameterized query
    const query = `SELECT * FROM users WHERE name = '${name}'`;
    const results = queryUsers(query);
    return NextResponse.json({ users: results });
  }

  // Filter by role if provided
  let users = getUsers();
  if (role && role !== "all") {
    users = users.filter((u) => u.role === role);
  }

  // Simulate variable response delay for race condition testing
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 200 + 50),
  );

  return NextResponse.json({ users });
}

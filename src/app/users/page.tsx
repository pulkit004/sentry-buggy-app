"use client";

/**
 * BUG 2: Race condition — stale closure in useEffect.
 *
 * When the filter changes rapidly, multiple fetches are in-flight simultaneously.
 * The stale closure captures the old filter value, and when a slower response
 * arrives after a faster one, it overwrites the UI with stale data.
 * This can cause "Cannot read property of undefined" when the component tries
 * to access properties that exist in one filter's data but not another's.
 */

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
}

export default function UsersPage() {
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // BUG: No cleanup/abort controller — stale responses can overwrite fresh data
    // Also: filter is captured by closure and may be stale when the response arrives
    fetch(`/api/users?role=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      });

    // Missing cleanup function — no AbortController to cancel stale requests
  }, [filter]);

  return (
    <main>
      <h1>Users</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>Filter by role: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Email</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Role</th>
              {/* BUG: Accessing department which may not exist for all filter results */}
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Department</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: "0.5rem" }}>{user.name}</td>
                <td style={{ padding: "0.5rem" }}>{user.email}</td>
                <td style={{ padding: "0.5rem" }}>{user.role}</td>
                {/* BUG: department.toUpperCase() crashes when department is undefined */}
                <td style={{ padding: "0.5rem" }}>{user.department!.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

import { describe, it, expect } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/users');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/users', () => {
  it('does not throw on SQL comment injection payload', async () => {
    const req = makeRequest({ name: "admin'/*" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    // Payload treated as a literal name — no match, no error
    expect(body.users).toHaveLength(0);
  });

  it('does not throw on OR-based injection payload', async () => {
    const req = makeRequest({ name: "' OR '1'='1" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toHaveLength(0);
  });

  it('does not throw on UNION SELECT injection payload', async () => {
    const req = makeRequest({ name: "' UNION SELECT * FROM users--" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toHaveLength(0);
  });

  it('returns the correct user for a valid exact name', async () => {
    const req = makeRequest({ name: 'Alice Johnson' });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toHaveLength(1);
    expect(body.users[0].name).toBe('Alice Johnson');
  });

  it('returns empty array when name does not match any user', async () => {
    const req = makeRequest({ name: 'Nobody Here' });
    const res = await GET(req);
    const body = await res.json();
    expect(body.users).toHaveLength(0);
  });

  it('returns only admin users when role=admin is supplied', async () => {
    const req = makeRequest({ role: 'admin' });
    const res = await GET(req);
    const body = await res.json();
    expect(body.users.length).toBeGreaterThan(0);
    expect(body.users.every((u: { role: string }) => u.role === 'admin')).toBe(true);
  });

  it('returns all users when no filters are supplied', async () => {
    const req = makeRequest({});
    const res = await GET(req);
    const body = await res.json();
    expect(body.users.length).toBeGreaterThan(0);
  });
});

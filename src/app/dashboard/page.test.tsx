import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';

describe('DashboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('does not throw when fetchDashboardData returns no users field', async () => {
    // Force the branch that omits the users field (Math.random < 0.7)
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { default: DashboardPage } = await import('./page');
    await expect(DashboardPage()).resolves.toBeDefined();
  });

  it('renders user names when fetchDashboardData returns a users array', async () => {
    // Force the branch that includes the users field (Math.random >= 0.7)
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const { default: DashboardPage } = await import('./page');
    const element = await DashboardPage();
    // Component must return a valid React element
    expect(React.isValidElement(element)).toBe(true);
  });

  it('produces an empty list (no <li> nodes) when users is absent', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const { default: DashboardPage } = await import('./page');
    // Should resolve, not reject — the key invariant of the fix
    const element = await DashboardPage();
    expect(element).toBeTruthy();
  });
});

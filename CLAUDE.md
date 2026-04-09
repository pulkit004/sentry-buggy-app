# Sentry Buggy App

Next.js 14 App Router application used as a test target for the sentry-agent pipeline.

## Conventions

- TypeScript, strict mode
- Next.js App Router (not Pages Router)
- Server Components by default; "use client" only when needed
- Use `@/` path alias for imports from `src/`
- Tailwind CSS is NOT used — use inline styles or CSS modules
- No external state management — use React state/context
- API routes in `src/app/api/` using Route Handlers

## Error Handling

- Server Components should handle errors gracefully with try/catch
- API routes should return proper HTTP status codes
- Use `notFound()` from `next/navigation` for missing resources
- Always validate user input before using in queries
- Use parameterized queries, never string interpolation for SQL

## Security

- Always sanitize HTML before rendering with dangerouslySetInnerHTML
- Use `crypto.timingSafeEqual` for constant-time comparisons
- Never leak internal error details in API responses
- Use AbortController in useEffect for cleanup

## Testing

- Tests use vitest
- Test files live next to source: `*.test.ts` / `*.test.tsx`

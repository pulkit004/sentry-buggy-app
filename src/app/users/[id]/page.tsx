import type { Metadata } from "next";
import { getUser } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * BUG 3: Unhandled async error in generateMetadata.
 *
 * When a user ID doesn't exist, getUser returns undefined.
 * Accessing .name on undefined throws a TypeError during SSR
 * metadata generation, crashing the entire page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = getUser(Number(id));

  // BUG: No null check — crashes when user doesn't exist
  return {
    title: `Profile: ${user.name}`,
    description: `View ${user.name}'s profile and activity`,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const user = getUser(Number(id));

  if (!user) {
    return (
      <main>
        <h1>User Not Found</h1>
        <p>No user with ID {id} exists.</p>
        <a href="/users">Back to users</a>
      </main>
    );
  }

  return (
    <main>
      <h1>{user.name}</h1>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Role</dt>
        <dd>{user.role}</dd>
      </dl>
      <a href="/users">Back to users</a>
    </main>
  );
}

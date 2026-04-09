--- a/src/app/dashboard/page.tsx
+++ b/src/app/dashboard/page.tsx
@@ -29,7 +29,7 @@ export default async function DashboardPage() {
   const data = await fetchDashboardData();
 
-  // BUG: data.users can be undefined — this will throw TypeError
-  const userNames = data.users.map((u) => u.name);
+  // FIXED: fall back to an empty array when users is undefined
+  const userNames = (data.users ?? []).map((u) => u.name);
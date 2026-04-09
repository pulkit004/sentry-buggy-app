--- a/src/app/users/[id]/page.tsx
+++ b/src/app/users/[id]/page.tsx
@@ -15,11 +15,16 @@ export async function generateMetadata({ params }: PageProps): Promise<Metadata>
   const { id } = await params;
   const user = getUser(Number(id));
 
-  // BUG: No null check — crashes when user doesn't exist
-  return {
-    title: `Profile: ${user.name}`,
-    description: `View ${user.name}'s profile and activity`,
-  };
+  if (!user) {
+    return {
+      title: "User Not Found",
+      description: "The requested user profile does not exist.",
+    };
+  }
+
+  return {
+    title: `Profile: ${user.name}`,
+    description: `View ${user.name}'s profile and activity`,
+  };
 }
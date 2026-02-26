import { cookies } from "next/headers";
import * as jose from "jose";

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__blerp_session")?.value;

  if (!token) {
    return { userId: null };
  }

  try {
    // In a real implementation, we would verify the JWT against the JWKS
    // For now, we'll decode it or use a placeholder
    const payload = jose.decodeJwt(token);
    return {
      userId: (payload.sub as string) || null,
    };
  } catch {
    return { userId: null };
  }
}

export async function currentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // Fetch user details from Blerp API
  // In a real app, this would use the Blerp SDK
  return {
    id: userId,
    firstName: "Mock",
    lastName: "User",
    emailAddresses: [{ emailAddress: "mock@example.com" }],
  };
}

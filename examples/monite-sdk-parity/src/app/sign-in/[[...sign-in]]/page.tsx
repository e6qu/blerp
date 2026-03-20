import { SignIn } from "@blerp/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}

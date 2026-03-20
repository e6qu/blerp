import { useState } from "react";
import { client } from "../../lib/api";
import { GitBranch, Mail, ArrowLeft, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMagicLink } from "../../hooks/useMagicLink";

type Step = "email" | "password" | "magic-link-sent" | "magic-link-verify";

export function SignIn() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signinId, setSigninId] = useState<string | null>(null);
  const [magicToken, setMagicToken] = useState("");
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const magicLink = useMagicLink();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signins", {
        body: {
          identifier: email,
          strategy: "password",
        },
      });

      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message || "Failed to sign in");
      } else {
        setSigninId(data.id);
        setStep("password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signins/{signin_id}/attempt", {
        params: { path: { signin_id: signinId! } },
        body: { password, identifier: email },
      });

      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message || "Invalid credentials");
      } else if (data.session) {
        window.location.assign("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    const { data, error: apiError } = await client.GET("/v1/auth/oauth/{provider}", {
      params: {
        path: { provider },
        query: { redirect_uri: window.location.origin + "/callback" },
      },
    });

    if (apiError) {
      setError("Failed to initiate OAuth");
    } else if (data.url) {
      window.location.assign(data.url);
    }
  };

  const handleBack = () => {
    setStep("email");
    setPassword("");
    setMagicToken("");
    setMagicLinkToken(null);
    setError(null);
    magicLink.setError(null);
  };

  const handleMagicLinkRequest = async () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }
    setError(null);
    const result = await magicLink.sendMagicLink(email);
    if (result) {
      setMagicLinkToken(result.token);
      setStep("magic-link-sent");
    } else {
      setError(magicLink.error);
    }
  };

  const handleMagicLinkVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await magicLink.verifyToken(magicToken);
    if (result?.session) {
      window.location.assign("/");
    } else {
      setError(magicLink.error);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">
        Sign in to your account
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {step === "email" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleOAuth("github")}
              className="flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              GitHub
            </button>
            <button
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signin-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:ring-blue-400 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Checking..." : "Continue"}
            </button>

            <button
              type="button"
              onClick={handleMagicLinkRequest}
              disabled={magicLink.isLoading || !email}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4" />
              {magicLink.isLoading ? "Sending..." : "Sign in with magic link"}
            </button>
          </form>
        </>
      )}

      {step === "magic-link-sent" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Magic link sent to <span className="font-medium">{email}</span>
          </p>

          {magicLinkToken && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-3">
              <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">
                Demo: paste this token to sign in
              </p>
              <code className="block text-xs break-all text-blue-900 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded px-2 py-1">
                {magicLinkToken}
              </code>
            </div>
          )}

          <form onSubmit={handleMagicLinkVerify} className="space-y-4">
            <div>
              <label
                htmlFor="magic-token"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Paste token
              </label>
              <input
                id="magic-token"
                type="text"
                value={magicToken}
                onChange={(e) => setMagicToken(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:ring-blue-400 sm:text-sm"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={magicLink.isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {magicLink.isLoading ? "Verifying..." : "Verify token"}
            </button>
          </form>
        </div>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Signing in as <span className="font-medium">{email}</span>
          </p>

          <div>
            <label
              htmlFor="signin-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:ring-blue-400 sm:text-sm"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link to="/" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </div>
  );
}

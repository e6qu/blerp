import { useState } from "react";
import { client } from "../../lib/api";
import { GitBranch, Mail } from "lucide-react";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signups", {
        body: {
          email,
          strategy: "password",
        },
      });

      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message || "Failed to sign up");
      } else {
        setStatus(`Signup initiated: ${data.id}. Please check your email.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google" | "discord") => {
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

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Create your account</h2>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleOAuth("github")}
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <GitBranch className="mr-2 h-4 w-4" />
          GitHub
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Mail className="mr-2 h-4 w-4" />
          Google
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Continue"}
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-green-600">{status}</p>}
    </div>
  );
}

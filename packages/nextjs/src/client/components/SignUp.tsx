"use client";

import React, { useState } from "react";
import { Github, Mail } from "lucide-react";
import { useBlerpClient } from "../BlerpProvider";

export function SignUp() {
  const client = useBlerpClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await client.POST("/v1/auth/signups", {
      body: {
        email,
        strategy: "password",
      },
    });

    if (error) {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      alert((error as any).error.message);
    } else if (data) {
      setStatus(`Signup initiated: ${data.id}. Please check your email.`);
    }
  };

  const handleOAuth = async (provider: "github" | "google" | "discord") => {
    const { data, error } = await client.GET("/v1/auth/oauth/{provider}", {
      params: {
        path: { provider },
        query: { redirect_uri: window.location.origin + "/callback" },
      },
    });

    if (error) {
      alert("Failed to initiate OAuth");
    } else if (data && data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Create your account</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleOAuth("github")}
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Github className="mr-2 h-4 w-4" />
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
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-green-600">{status}</p>}
    </div>
  );
}

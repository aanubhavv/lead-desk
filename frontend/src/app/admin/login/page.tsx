"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { login, ApiRequestError } from "@/lib/api";

interface FormErrors {
  username?: string;
  password?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!username.trim()) {
      errs.username = "Username is required.";
    } else if (username.trim().length < 3) {
      errs.username = "Username must be at least 3 characters.";
    }
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      await login({ username: username.trim(), password });
      router.push("/admin");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          setGeneralError("Invalid username or password.");
        } else {
          setGeneralError(err.data.message || "Login failed.");
        }
      } else {
        setGeneralError("Network error. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-white mt-4">
            Admin Login
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage your leads
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-6 sm:p-8 glow">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="login-username"
              name="username"
              label="Username"
              placeholder="admin"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                if (generalError) setGeneralError("");
              }}
              error={errors.username}
              autoComplete="username"
              autoFocus
            />

            <Input
              id="login-password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                if (generalError) setGeneralError("");
              }}
              error={errors.password}
              autoComplete="current-password"
            />

            {generalError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {generalError}
              </div>
            )}

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-xs text-slate-600">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
    gender: ""
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register({
        ...form,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
      });
      navigate("/feed", { replace: true });
    } catch (err: unknown) {
      setError((err as Error)?.message || "Registration failed");
    }
  }

  return (
    <div className={classNames(
      "min-h-screen grid place-items-center py-8 transition-colors duration-200",
      isDark ? "bg-black" : "bg-gray-50"
    )}>
      <div className="w-full max-w-lg px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white grid place-items-center text-2xl font-bold shadow-lg">
            S
          </div>
          <h1 className={classNames(
            "text-3xl font-bold tracking-tight mb-2 transition-colors duration-200",
            isDark ? "text-white" : "text-gray-900"
          )}>
            Join Space
          </h1>
          <p className={classNames(
            "transition-colors duration-200",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            Create your account to get started
          </p>
        </div>

        {/* Form Card */}
        <div className={classNames(
          "rounded-2xl border p-8 transition-all duration-200 shadow-lg",
          isDark
            ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm"
            : "border-gray-200 bg-white"
        )}>
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={classNames(
                  "block text-sm font-medium mb-2 transition-colors duration-200",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  First name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    required
                    className={classNames(
                      "w-full rounded-xl border px-10 py-3 outline-none transition-all duration-200",
                      "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                      isDark
                        ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    )}
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className={classNames(
                  "block text-sm font-medium mb-2 transition-colors duration-200",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  Last name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    required
                    className={classNames(
                      "w-full rounded-xl border px-10 py-3 outline-none transition-all duration-200",
                      "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                      isDark
                        ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    )}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={classNames(
                "block text-sm font-medium mb-2 transition-colors duration-200",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className={classNames(
                    "w-full rounded-xl border px-10 py-3 outline-none transition-all duration-200",
                    "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                    isDark
                      ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  )}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={classNames(
                "block text-sm font-medium mb-2 transition-colors duration-200",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Phone number
              </label>
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                  required
                  className={classNames(
                    "w-full rounded-xl border px-10 py-3 outline-none transition-all duration-200",
                    "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                    isDark
                      ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  )}
                  placeholder="+1234567890"
                />
              </div>
            </div>
            {/* Gender */}
            <div>
              <label className={classNames(
                "block text-sm font-medium mb-2 transition-colors duration-200",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                required
                className={classNames(
                  "w-full rounded-xl border px-3 py-3 outline-none transition-all duration-200",
                  "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                  isDark
                    ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                )}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className={classNames(
                "block text-sm font-medium mb-2 transition-colors duration-200",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Date of birth
              </label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  required
                  className={classNames(
                    "w-full rounded-xl border px-10 py-3 outline-none transition-all duration-200",
                    "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                    isDark
                      ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={classNames(
                "block text-sm font-medium mb-2 transition-colors duration-200",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  className={classNames(
                    "w-full rounded-xl border px-10 py-3 outline-none transition-all duration-200",
                    "focus:ring-2 focus:ring-[#5296dd] focus:border-[#5296dd]",
                    isDark
                      ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  )}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={classNames(
                "w-full flex items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all duration-200",
                "bg-gradient-to-r from-[#5296dd] to-[#92bddf] text-white",
                "hover:shadow-lg hover:scale-105",
                "disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
              )}
            >
              {loading ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className={classNames(
          "mt-6 text-center text-sm transition-colors duration-200",
          isDark ? "text-gray-400" : "text-gray-600"
        )}>
          Already have an account?{" "}
          <Link
            className="text-[#5296dd] hover:underline font-medium transition-colors duration-200"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(formData);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen w-full">
        {/* =====================================================
            LEFT BRAND PANEL
        ====================================================== */}

        <div className="relative hidden overflow-hidden bg-[#020617] lg:flex lg:w-[52%]">
          {/* Background gradients */}

          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />

          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-blue-800/20 blur-[120px]" />

          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />

          {/* Grid */}

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Content */}

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Logo */}

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40">
                  <span className="text-xl font-black text-white">P</span>
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-wide text-white">
                    PAYKAR
                  </h1>

                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-blue-400">
                    Admin Panel
                  </p>
                </div>
              </div>
            </div>

            {/* Main content */}

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
                <ShieldCheck size={17} />
                Secure Payment Management
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Manage your payments
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  smarter & faster.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Monitor transactions, manage vendors, track payment activity,
                and control your administration from one secure dashboard.
              </p>

              {/* Feature cards */}

              <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
                <Feature
                  title="Secure"
                  description="Protected access"
                />

                <Feature
                  title="Powerful"
                  description="Complete control"
                />

                <Feature
                  title="Real-time"
                  description="Payment tracking"
                />
              </div>
            </div>

            {/* Footer */}

            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} Paykar. Admin Portal.
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}

        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:w-[48%]">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}

            <div className="mb-10 flex items-center justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
                  <span className="text-xl font-black text-white">P</span>
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    PAYKAR
                  </h1>

                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                    Admin Panel
                  </p>
                </div>
              </div>
            </div>

            {/* Login card */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
              {/* Heading */}

              <div className="mb-8">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LockKeyhole size={21} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access your Paykar administration dashboard.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}

                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Username
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Security note */}

              <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-xs leading-5 text-slate-500">
                  Your administrator credentials are protected. Never share
                  your password with anyone.
                </p>
              </div>
            </div>

            {/* Mobile footer */}

            <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
              © {new Date().getFullYear()} Paykar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ title, description }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400" />

        <span className="text-sm font-semibold text-white">{title}</span>
      </div>

      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
};

export default Login;
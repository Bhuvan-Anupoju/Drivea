import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { LockIcon, MailIcon, UserIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useApp } from "../context/appContext";

const Login = ({ mode = "login" }) => {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { login, register } = useApp();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const ok = isRegister
      ? await register(form.name, form.email, form.password)
      : await login(form.email, form.password);
    setIsLoading(false);
    if (ok) navigate("/");
  };

  return (
    <div className="min-h-screen text-zinc-900 flex flex-col md:flex-row">
      {/* Left Hero Brand panel */}
      <div className="md:w-1/2 p-8 md:p-12 lg:p-16 bg-linear-to-br from-orange-50 via-zinc-100 to-red-50 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')]"></div>
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.svg" className="max-h-9" alt="logo" />
          <span className="text-4xl font-medium uppercase text-zinc-900">
            Drivea
          </span>
        </div>
        <div className="relative z-10 my-12 space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-light text-zinc-900 leading-tight">
            Secure, Simple & Fast <br />{" "}
            <span className="text-orange-600">Cloud Storage</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-600 max-w-md leading-relaxed">
            Store your files securely in our drive, organize into folders, share
            with permissions and access anywhere.
          </p>
        </div>
        <div className="relative z-10 text-sm text-zinc-500">
          {" "}
          &copy; 2026 BhuvanAnupoju. All rights reserved.
        </div>
      </div>
      <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div>
            <h3>{isLoading ? "Create an account" : "Welcome back"}</h3>
            <p className="text-sm text-zinc-500 mt-1">
              {isRegister
                ? "Enter your details below to get started with 1GB free storage"
                : "Enter your credentials to access your Drive"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full Name"
                icon={UserIcon}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Doe"
                required
              />
            )}
            <Input
              label="Email Address"
              type="email"
              icon={MailIcon}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="user@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              icon={LockIcon}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="..........."
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              isLoading={isLoading}
            >
              <span className="font-medium text-base">
                {isRegister ? "Register Account" : "Sign In"}
              </span>
            </Button>
          </form>
          <div className="text-center pt-2">
            {isRegister ? (
              <p className="text-xs text-zinc-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                Don't have an account yet?{" "}
                <Link
                  to="/register"
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Create account
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

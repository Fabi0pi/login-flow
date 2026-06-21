import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}

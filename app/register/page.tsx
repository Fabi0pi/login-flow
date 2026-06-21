import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <RegisterForm />
      </div>
    </main>
  );
}

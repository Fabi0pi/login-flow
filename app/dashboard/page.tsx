"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth/useAuth";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-8 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Sign out
        </button>
      </div>

      <div className="space-y-2 rounded-lg border p-6">
        <p className="text-sm text-zinc-500">Logged in as</p>
        <p className="font-medium">{user?.email}</p>
        <p className="text-xs text-zinc-400">ID: {user?.id}</p>
      </div>
    </main>
  );
}

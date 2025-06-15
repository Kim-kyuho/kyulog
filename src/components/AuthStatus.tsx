// src/components/AuthStatus.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Loading...</p>;

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("github")}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.012c0 4.421 2.865 8.166 6.839 9.489.5.09.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.455-1.155-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.112-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.908-1.296 2.746-1.026 2.746-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.944.359.309.678.919.678 1.853 0 1.337-.012 2.417-.012 2.747 0 .267.18.576.688.479A10.015 10.015 0 0 0 22 12.012C22 6.484 17.523 2 12 2z" clipRule="evenodd" />
        </svg>
        Sign in
      </button>
    );
  }

  const user = session.user;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">
        Hi, {user.login ?? user.name}
      </span>
      <span className={`text-xs font-semibold ${user.isAdmin ? "text-green-600" : "text-gray-500"}`}>
        {user.isAdmin ? "Admin" : "Viewer"}
      </span>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-200 text-red-800 rounded hover:bg-red-300 active:scale-95 transition-transform"
      >
        Logout
      </button>
    </div>
  );
}
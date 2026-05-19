import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  user: { email: string; oid: string } | null;
  children: ReactNode;
}

export default function Layout({ user, children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">DfE</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            Digital Standards Maturity Model
          </h1>
        </Link>
        {user && (
          <span className="text-sm text-gray-500">{user.email}</span>
        )}
      </header>
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-gray-200 px-6 py-3 text-center text-xs text-gray-400">
        DfE Digital &amp; Technology Standards for Schools &amp; Colleges
      </footer>
    </div>
  );
}

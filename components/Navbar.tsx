'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 mb-6">
      <div className="flex items-center justify-between py-4">
        <div className="flex gap-4">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg transition-colors ${
              pathname === '/'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Home
          </Link>
          <Link
            href="/profile"
            className={`px-4 py-2 rounded-lg transition-colors ${
              pathname === '/profile'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Profile
          </Link>
          <Link
            href="/admin"
            className={`px-4 py-2 rounded-lg transition-colors ${
              pathname === '/admin'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Admin
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

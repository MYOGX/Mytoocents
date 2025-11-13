import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'MyToo ¢',
  description: 'Share your opinion, one question at a time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-blue-600">MyToo ¢ 💰</h1>
            </div>
          </header>
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
            <Navbar />
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-4">
            <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
              Share your opinion daily and earn ¢!
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

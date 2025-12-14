import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Money Manager',
  description: 'Personal Finance Tracker',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

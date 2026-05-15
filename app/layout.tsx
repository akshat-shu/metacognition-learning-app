import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reverse Tutor',
  description: 'Teach an AI student and learn to calibrate trust',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

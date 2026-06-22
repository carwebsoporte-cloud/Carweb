import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel Administrativo | CARWEB',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#020617]">{children}</div>;
}

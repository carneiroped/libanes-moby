import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal do Cliente - Moby',
  description: 'Acompanhe seus imóveis, contratos e documentos',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
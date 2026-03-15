import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Folio Editor — Demo',
  description: 'Paginated document editor demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, width: '100%', overflowX: 'hidden' }}>
      <body style={{
        margin: 0,
        padding: 0,
        width: '100%',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        {children}
      </body>
    </html>
  );
}

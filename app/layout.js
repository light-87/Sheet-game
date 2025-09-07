import './globals.css';

export const metadata = {
  title: 'Voice BI Assistant',
  description: 'Voice-powered business intelligence assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
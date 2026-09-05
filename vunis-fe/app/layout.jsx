import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';

// IBM Plex was drawn for IBM's own technical/engineering documentation — a deliberate
// fit for a tool that fuses Jira's task tracking with MS Project's schedule planning,
// instead of the Inter-everywhere look most SaaS dashboards default to.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'VUNIS Workspace',
  description: 'VUNIS Enterprise Agile Task & Project Management System',
};

// Tells the browser this app is light-only, so Chromium/Edge "auto dark mode"
// (which inverts pages that don't declare a color-scheme) doesn't kick in and
// wash out the palette with glaring inverted colors on dark-mode OSes.
export const viewport = {
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${plexSans.variable} ${plexMono.variable} font-sans antialiased text-ink bg-bg`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

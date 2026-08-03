import { Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'KS Platform - Enterprise Workspace',
  description: 'Hệ thống quản lý công việc Skys Workspace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased text-ink bg-bg`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

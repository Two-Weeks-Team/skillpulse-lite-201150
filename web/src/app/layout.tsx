import '@/app/globals.css';
import { Inter, DM_Serif_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '600'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], variable: '--font-dm', weight: ['400', '700'] });

export const metadata = {
  title: 'SkillPulse Lite',
  description: '5‑minute micro‑lessons with instant feedback.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}

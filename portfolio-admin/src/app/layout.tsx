import type { Metadata } from 'next';
import { Geist, Geist_Mono, Oxanium } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import StoreProvider from '@/store/storeProvider';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const oxanium = Oxanium({
    variable: '--font-oxanium',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Admin | Fi Amanillah',
    description: 'Admin panel for Portfolio | Fi Amanillah',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={` ${oxanium.variable} ${geistSans.variable} ${geistMono.variable} font-oxanium  bg-background  antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster />
                    <StoreProvider>{children}</StoreProvider>{' '}
                </ThemeProvider>
            </body>
        </html>
    );
}

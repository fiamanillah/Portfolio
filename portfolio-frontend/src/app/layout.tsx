import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import '@/app/globals.css';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/header/Header';

// const geistSans = Geist({
//     variable: '--font-geist-sans',
//     subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//     variable: '--font-geist-mono',
//     subsets: ['latin'],
// });

const oxanium = localFont({
    src: [
        {
            path: '../../public/Oxanium/Oxanium-VariableFont_wght.ttf',
            weight: '400',
        },
        {
            path: '../../public/Oxanium/Oxanium-VariableFont_wght.ttf',
            weight: '500',
        },
        {
            path: '../../public/Oxanium/Oxanium-VariableFont_wght.ttf',
            weight: '600',
        },
        {
            path: '../../public/Oxanium/Oxanium-VariableFont_wght.ttf',
            weight: '700',
        },
        {
            path: '../../public/Oxanium/Oxanium-VariableFont_wght.ttf',
            weight: '800',
        },
    ],
    variable: '--font-oxanium',
});

export const metadata = {
    title: 'Fi Amanillah',
    description: 'Fi Amanillah - Portfolio',
};

// Define Props Type
interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={` ${oxanium.variable}  font-oxanium  bg-background  antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster />
                    <Header />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "notBruce",
    description: "Support your favorite streamers",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-background font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed antialiased">
                {/* Global Navigation */}
                <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30">
                    <div className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
                        <div className="flex items-center gap-8">
                            <a className="font-display text-[28px] text-primary tracking-tighter" href="/">notBruce</a>
                            <div className="hidden md:flex gap-6">
                                <a className="text-on-surface-variant font-body-md hover:text-primary transition-colors duration-200" href="#">Clips</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-highest"></div>
                        </div>
                    </div>
                </nav>

                {children}

                {/* Global Footer */}
                <footer className="w-full py-margin-desktop border-t border-outline-variant/20 bg-surface">
                    <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-4">
                        <div className="flex items-center gap-6">
                            <span className="font-headline-md text-headline-md text-on-surface text-[18px]">notBruce</span>
                            <span className="font-body-md text-body-md text-on-surface-variant text-[14px] hidden md:block">
                                © 2024 notBruce Stream Labs. Technical Precision in Performance.
                            </span>
                        </div>
                        <div className="flex gap-6">
                            <a className="text-on-surface-variant font-label-sm hover:text-primary transition-opacity" href="#">Privacy Policy</a>
                            <a className="text-on-surface-variant font-label-sm hover:text-primary transition-opacity" href="#">Terms of Service</a>
                            <a className="text-on-surface-variant font-label-sm hover:text-primary transition-opacity" href="#">Support</a>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
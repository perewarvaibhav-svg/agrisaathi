import type { Metadata } from "next";
import "./globals.css";
import "./awwwards.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "AgriSaathi AI — Intelligent Farming Copilot",
    description:
        "AI-powered governance and financial assistant for Indian farmers. Find schemes, analyze contracts, track market prices, and automate applications with LLM intelligence.",
    keywords: [
        "AgriSaathi",
        "AI farming assistant",
        "government schemes",
        "agricultural loans",
        "market prices",
        "crop advisory",
        "PM-KISAN",
        "farmer technology",
    ],
    openGraph: {
        title: "AgriSaathi AI — Intelligent Farming Copilot",
        description:
            "A unified AI layer between farmers and government + financial systems.",
        type: "website",
    },
    icons: {
        icon: "/logo.png",
    },
};

import Script from "next/script";
import LenisProvider from "@/components/LenisProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {/* Hydration-safe Google Translate Injection */}
                <Script
                    id="google-translate-init"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            function googleTranslateElementInit() {
                                new google.translate.TranslateElement({
                                    pageLanguage: 'en',
                                    autoDisplay: false
                                }, 'google_translate_element');
                            }
                        `
                    }}
                />
                <Script
                    src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                    strategy="afterInteractive"
                />

                {/* Hidden anchor for Google Translate */}
                <div id="google_translate_element" style={{ display: "none", visibility: "hidden" }}></div>

                <LenisProvider>
                    <Providers>{children}</Providers>
                </LenisProvider>
            </body>
        </html>
    );
}

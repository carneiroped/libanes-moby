// import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { AccountProvider } from "@/providers/account-context";
import AuthProvider from "@/providers/auth-provider";
import "./globals.css";

// Validar variáveis de ambiente na inicialização
import '@/lib/config/validate-on-startup';

// const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://demomoby.moby.casa'),
  title: {
    default: "Moby - Alta Performance em Vendas Imobiliárias",
    template: "%s | Moby"
  },
  description: "Plataforma de alta performance para vendas imobiliárias com IA integrada. Aumente suas conversões e acelere suas vendas.",
  keywords: ["imobiliária", "vendas", "alta performance", "gestão imobiliária", "IA", "inteligência artificial", "automação", "imóveis", "Moby", "demonstração"],
  authors: [{ name: "Moby" }],
  creator: "Moby",
  publisher: "Moby",
  applicationName: "Moby",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://demomoby.moby.casa",
    title: "Moby - Alta Performance em Vendas Imobiliárias",
    description: "Plataforma de alta performance para vendas imobiliárias com IA integrada.",
    siteName: "Moby",
    images: [{
      url: "/images/logo-dark.png",
      width: 1200,
      height: 630,
      alt: "Moby - Alta Performance em Vendas Imobiliárias"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moby - Alta Performance em Vendas Imobiliárias",
    description: "Plataforma de alta performance para vendas imobiliárias com IA integrada.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://imobiliaria.moby.casa" />
        <meta name="theme-color" content="#00B87C" />
      </head>
      <body className="font-sans">
        <AccountProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
            >
              <Providers>
                {children}
              </Providers>
            </ThemeProvider>
          </AuthProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
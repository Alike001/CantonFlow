import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CantonFlow",
    template: "%s | CantonFlow",
  },
  description:
    "A privacy-preserving invoice financing platform built on Canton Network. CantonFlow enables suppliers, lenders, and regulators to collaborate securely using selective disclosure and atomic settlement.",
  keywords: [
    "Canton Network",
    "Invoice Financing",
    "Trade Finance",
    "Privacy",
    "DAML",
    "Tokenized Assets",
    "Institutional Finance",
    "Encode Club Hackathon",
  ],
  authors: [
    {
      name: "Hammed Ali Oyeleye",
    },
  ],
  creator: "Hammed Ali Oyeleye",
  openGraph: {
    title: "CantonFlow",
    description:
      "Privacy-preserving invoice financing powered by Canton Network.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
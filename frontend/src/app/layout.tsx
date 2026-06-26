import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuraPaper — AI Research Paper Summarizer & Assistant",
  description:
    "Upload research papers, extract structured AI summaries, chat with documents using RAG, and compare papers side-by-side. Powered by Google Gemini & LangChain.",
  keywords: ["research paper", "AI summary", "RAG", "Gemini", "PDF", "academic"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable} style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

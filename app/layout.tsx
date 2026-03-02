import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quo Investor OS",
  description: "Decision and offer-intent OS for California property investors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}

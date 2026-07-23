import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ForgeFence — MCP session fence | ForgeMeter",
  description:
    "Stop agent exfiltration after injection succeeds. ForgeFence applies session information-flow control to MCP tool calls. A ForgeMeter product by Saabsa Solutions.",
  metadataBase: new URL("https://fence.forgemeter.com"),
  openGraph: {
    title: "ForgeFence | ForgeMeter",
    description: "Session information-flow control for MCP agents.",
    url: "https://fence.forgemeter.com",
    siteName: "ForgeFence",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

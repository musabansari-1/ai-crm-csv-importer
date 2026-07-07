import "./globals.css";

export const metadata = {
  title: "AI-Powered CSV Importer",
  description: "Upload any CSV file and intelligently map lead data into a standardized CRM format using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

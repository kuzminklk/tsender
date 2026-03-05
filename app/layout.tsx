

/* Main layout with providers bundle */


import type { Metadata } from "next";

import { Providers } from "@/app/providers"
import { Header } from "@/app/header";

import "./globals.css";


export const metadata: Metadata = {
  title: "TSender",
  description: "Gas-efficient tokens sender",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<Providers>
			<html lang="en">
				<body>
					<Header />
					{children}
				</body>
			</html>
		</Providers>
  );
}

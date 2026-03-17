

/* Main layout with providers bundle */


import type { Metadata } from "next";

import { Providers } from "@/app/providers"
import { Header } from "@/app/header";
import { Footer } from "./footer";

import "./mobile.css";


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
			<html lang="en">
					<body>
						<Providers>
							<Header />
							{children}
							<Footer />
						</Providers>
					</body>
			</html>
  );
}

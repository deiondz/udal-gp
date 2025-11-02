import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { ReactQueryProvider } from "~/lib/react-query";

export const metadata: Metadata = {
	title: "Zilla Panchayat Waste Management Dashboard",
	description:
		"A centralized platform for monitoring and managing rural solid waste collection, segregation, and processing across Gram Panchayats and MRF units under the Zilla Panchayat.",
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<head>
				<link
					rel="icon"
					href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📦</text></svg>"
				/>
			</head>
			<body>
				<ReactQueryProvider>
					{children}
					<Toaster richColors />
				</ReactQueryProvider>
			</body>
		</html>
	);
}



/* Wallets, Web-3 things providers bundle */


"use client"


import { type ReactNode, useState } from 'react'
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import config from "@/rainbowKit.config"


export function Providers(props: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					{ props.children }
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	)
}
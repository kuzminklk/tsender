

/* Wrapper to check wallet connection and display message if there are no connection */


"use client"


import { useState, useEffect } from "react"
import { useAccount } from "wagmi"

import { Form } from "@/app/form";


export function Connection() {

	const { isConnected } = useAccount()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if(!mounted) return null

	return isConnected ? <Form /> : <h2 className="connection-alert">Please connect a wallet</h2>

}
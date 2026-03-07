

/* Form Component for sending tokens (core project functionality) */


"use client"


import { SubmitEventHandler, useState, useMemo } from "react"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"

import { chainsToTSender, tsenderAbi, erc20Abi } from "@/app/lib/constants";



// Form component
export function Form() {

	const [tokenAddress, setTokenAddress] = useState<`0x${string}`>("0x");
	const [recepients, setRecepients] = useState<string>("");
	const [amounts, setAmounts] = useState<string>("");

	const chainId = useChainId()
	const config = useConfig()
	const account = useAccount()
	const { data: hash, isPending, writeContractAsync } = useWriteContract()

	const total: string = useMemo(() => calculateTotal(amounts), [amounts])


	async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault()

		const tSenderAddress = chainsToTSender[chainId]["tsender"]
		const approvedAmout = await getApprovedAmount(tSenderAddress)

		// Send approve transaction to the blockchain if there are not enought approved
		if (approvedAmout < Number(total)) {
			const approvalHash = await writeContractAsync({
				abi: erc20Abi,
				address: tokenAddress as `0x${string}`,
				functionName: "approve",
				args: [tSenderAddress, BigInt(total)]
			})

			// Wait for confirmation
			const approvalReceipt = await waitForTransactionReceipt(config, {
				hash: approvalHash
			})

			if (!approvalReceipt) {
				return
			}
		}

		await writeContractAsync({
			abi: tsenderAbi,
			address: tSenderAddress,
			functionName: "airdropERC20",
			args: [
				tokenAddress as `0x${string}`,
				recepients.split(/[,\n]+/).map(address => address.trim()).filter(address => address !== ""),
				amounts.split(/[,\n]+/).map(address => address.trim()).filter(address => address !== ""),
				BigInt(total)
			]
		})

	}


	// Get approved amount of ERC20 tokens
	async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
		if (!tSenderAddress) {
			return 0
		}

		if (!tokenAddress.startsWith("0x")) {
			return 0
		}

		// Read data from blockchain
		const response = await readContract(config, {
			abi: erc20Abi,
			address: tokenAddress as `0x${string}`,
			functionName: "allowance",
			args: [account.address, tSenderAddress]
		})

		return Number(response)
	}


	return (
		<section className="formSection">
			<form onSubmit={handleSubmit}>
				<div>
					<div>
							<label htmlFor="tokenAddress">Token Address:</label>
							<label htmlFor="recepients">Recepients Addresses: <br />(comma or new line separated)</label>
							<label htmlFor="amounts">Amounts: <br />(wei; comma or new line separated)</label>
						</div>
					</div>

					<div>
						<input type="text" placeholder="0x…" id="tokenAddress" value={ tokenAddress } onChange={(event) => { setTokenAddress(event.target.value) }}></input>
						<textarea placeholder="0x123…, 0x456…" id="recepients" value={ recepients } onChange={(event) => { setRecepients(event.target.value) }}></textarea>
						<textarea placeholder="1000, 2000" id="amounts" value={ amounts } onChange={(event) => { setAmounts(event.target.value) }}></textarea>
					</div>	

					<button type="submit" disabled={isPending}>
						{isPending ? "Sending..." : "Send Tokens"}
					</button>
			</form>
		</section>
	)
}



// Calculate total amounts
export function calculateTotal(amounts: string): string {
	// Parse text
	const numbers = amounts
		.split(/[\n,]+/)
		.map(string => string.trim())
		.filter(string => string !== "")
		.map(string => parseFloat(string))

	// Calculate
	return numbers
		.filter(num => !isNaN(num))
		.reduce((sum, number) => sum + number, 0).toString()
}



/* Form Component for sending tokens (core project functionality) */


"use client"


import { useState, useMemo } from "react"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"

import { chainsToTSender, tsenderAbi, erc20Abi } from "@/app/lib/constants";



// Form component
export function Form() {

	const [tokenAddress, setTokenAddress] = useState<string>("0x");
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
				address: tokenAddress,
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
				tokenAddress,
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
			address: tokenAddress,
			functionName: "allowance",
			args: [account.address, tSenderAddress]
		})

		return Number(response)
	}


	return (
		<section className="formSection">
			<div className="formSection-title">
				TSender.exe
			</div>
			<form onSubmit={handleSubmit}>
				<div>
					<div>
						<div className="input-group">
							<label htmlFor="tokenAddress">Token Address:</label>
							<input type="text" placeholder="0x…" id="tokenAddress" value={ tokenAddress } onChange={(event) => { setTokenAddress(event.target.value) }}></input>
						</div>
						<div className="input-group">
							<label htmlFor="recepients">Recipients (comma or new line separated):</label>
							<textarea placeholder="0x123…, 0x456…" id="recepients" value={ recepients } onChange={(event) => { setRecepients(event.target.value) }}></textarea>
						</div>
					</div>

					<div>
						<div className="input-group">
							<label htmlFor="amounts">Amounts (wei; comma or new line separated):</label>
							<textarea placeholder="1000, 2000" id="amounts" value={ amounts } onChange={(event) => { setAmounts(event.target.value) }}></textarea>
						</div>
						<div className="input-group">
							<label>Total Amount:</label>
							<div className="totalDisplay">
								{total || "0"}
							</div>
						</div>
					</div>	
				</div>
				<div className="button-group">
					<button type="submit" disabled={isPending}>
						{isPending ? "Sending..." : "Send Tokens"}
					</button>
					<button type="button" onClick={() => window.location.reload()}>
						Exit
					</button>
				</div>
				{hash && (
					<div className="statusBar">
						<div className="statusBar-field">
							✓ TxHash: {hash.substring(0, 10)}...
						</div>
					</div>
				)}
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

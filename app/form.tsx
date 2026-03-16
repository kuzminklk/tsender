


/* Form Component for sending tokens (core project functionality) */


"use client"; // Client component


import { SubmitEventHandler, useState, useMemo } from "react";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";

import { chainsToTSender, tsenderAbi, erc20Abi } from "@/app/lib/constants";
import {
	calculateTotal,
	isValidAddress,
	parseAndValidateAmounts,
	parseAndValidateRecipients,
} from "./lib/validation";



// Interfaces
interface FormErrors {
	tokenAddress?: string;
	recipients?: string[];
	amounts?: string[];
	general?: string;
}

interface FormState {
	isProcessing: boolean;
	successMessage?: string;
	errorMessage?: string;
}


// Form component
export function Form() {

	// ——— Variables ———
	// Form inputs
	const [tokenAddress, setTokenAddress] = useState<`0x${string}`>("0x");
	const [recipients, setRecipients] = useState<string>("");
	const [amounts, setAmounts] = useState<string>("");

	// Wagmi tools
	const chainId = useChainId();
	const config = useConfig();
	const account = useAccount();
	const { data: hash, isPending, writeContractAsync } = useWriteContract();

	// Errors
	const [errors, setErrors] = useState<FormErrors>({});

	// Form State
	const [formState, setFormState] = useState<FormState>({ isProcessing: false })

	// Total
	let total: string = "0"

	// ——— Handle updates. Real-time validation, parsing ———
	function handleTokenAddressChange(value: string) {
		setTokenAddress(value as `0x${string}`);
		if (value && !isValidAddress(value)) {
			setErrors((previous) => ({
				...previous,
				tokenAddress: "Invalid address format (must be 0x + 40 hex chars)",
			}));
		} else {
			setErrors((previous) => {
				const { tokenAddress, ...rest } = previous;
				return rest;
			});
		}
		setFormState({ isProcessing: false })
	}

	function handleRecipientsChange(value: string) {
		setRecipients(value);
		if (value.trim()) {
			const { errors: recipientsErrors } = parseAndValidateRecipients(value);
			if (recipientsErrors.length > 0) {
				setErrors((previous) => ({
					...previous,
					recipients: recipientsErrors,
				}));
			} else {
				setErrors((previous) => {
					const { recipients, ...rest } = previous;
					return rest;
				});
			}
		}
		setFormState({ isProcessing: false })
	}

	function handleAmountsChange(value: string) {
		setAmounts(value);
		if (value.trim()) {
			const { errors: amountErrors } = parseAndValidateAmounts(value);
			if (amountErrors.length > 0) {
				setErrors((previous) => ({ ...previous, amounts: amountErrors }));
			} else {
				setErrors((previous) => {
					const { amounts, ...rest } = previous;
					return rest;
				});
			}
		}
		setFormState({ isProcessing: false })
	}


	// ——— Get approved amount of ERC20 tokens ———
	async function getApprovedAmount(
		tSenderAddress: string | null,
	): Promise<bigint> {
		if (!tSenderAddress) {
			return BigInt(0);
		}

		if (!tokenAddress.startsWith("0x")) {
			return BigInt(0);
		}

		// Read data from blockchain
		try {
		const response = await readContract(config, {
			abi: erc20Abi,
			address: tokenAddress as `0x${string}`,
			functionName: "allowance",
			args: [account.address, tSenderAddress],
		});
		return BigInt(response as string);
		} catch {
			return BigInt(0)
		}
	}


	// ——— Handle submit ———
	async function handleSubmit(
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		setFormState({ isProcessing: true })

		// Validate and parse inputs
		const tokenError = !isValidAddress(tokenAddress)
			? "invalid token address"
			: null;
		const { addresses: parsedRecipients, errors: recipientsErrors } =
			parseAndValidateRecipients(recipients);
		const { amounts: parsedAmounts, errors: amountErrors } =
			parseAndValidateAmounts(amounts);

		// Set errors if they are
		if (tokenError || recipientsErrors.length > 0 || amountErrors.length > 0) {
			setErrors({
				tokenAddress: tokenError || undefined,
				recipients: recipientsErrors.length > 0 ? recipientsErrors : undefined,
				amounts: recipientsErrors.length > 0 ? recipientsErrors : undefined,
			});
			setFormState({ isProcessing: false })
			return;
		}

		if (parsedRecipients.length !== parsedAmounts.length) {
			setErrors({
				recipients: ["Number of recipients must match number of amounts"],
				amounts: ["Number of amounts must match number of recipients"],
			});
			setFormState({ isProcessing: false })
			return;
		}

		// Parse and set total amount
		total = useMemo(
			() => calculateTotal(parsedAmounts),
			[parsedAmounts],
		);

		try {
			// Address of TSender contract
			const tSenderAddress = chainsToTSender[chainId]["tsender"];
			// Get approved amount of tokens
			const approvedAmount = await getApprovedAmount(tSenderAddress);

			// Send approve transaction to the blockchain if there are not enought approved
			if (approvedAmount < BigInt(total)) {
				const approvalHash = await writeContractAsync({
					abi: erc20Abi,
					address: tokenAddress as `0x${string}`,
					functionName: "approve",
					args: [tSenderAddress, BigInt(total)],
				});

				// Wait for confirmation
				const approvalReceipt = await waitForTransactionReceipt(config, {
					hash: approvalHash,
				});

				if (!approvalReceipt) {
					return;
				}
			}

			// Send transaction to the TSender smart-contract
			await writeContractAsync({
				abi: tsenderAbi,
				address: tSenderAddress,
				functionName: "airdropERC20",
				args: [
					tokenAddress as `0x${string}`,
					parsedRecipients,
					parsedAmounts,
					BigInt(total),
				],
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Transactoion failed"
			setFormState({
				isProcessing: false,
				errorMessage: errorMessage
			})
		}
	}


	// ——— UI ———
	const hasErrors = Object.keys(errors).length > 0
	const isDisabled = isPending || hasErrors || !tokenAddress.startsWith("0x") || !recipients.trim() || amounts.trim()
	
	return (
		<form onSubmit={handleSubmit}>
			{ formState.successMessage && (
				<section className="successMessage">{ formState.successMessage }</section>
			)}

			{ formState.errorMessage && (
				<section className="errorMessage">{ formState.errorMessage }</section>
			)}

			<section>
				<label htmlFor="tokenAddress">Token Address:</label>
				{errors.tokenAddress && (
					<p className="errorMessage">{errors.tokenAddress}</p>
				)}
				<input
					type="text"
					placeholder="0x1234567890123456789012345678901234567890"
					id="tokenAddress"
					value={tokenAddress}
					onChange={(event) => {
						handleTokenAddressChange(event.target.value);
					}}
					className={	errors.tokenAddress ? "inputError" : "" }
				></input>
			</section>

			<section>
				<label htmlFor="recipients">
					Recipients Addresses:
					<p>(comma or new line separated)</p>
				</label>
				<textarea
					placeholder="0x123…, 0x456…"
					id="recipients"
					value={recipients}
					onChange={(event) => {
						handleRecipientsChange(event.target.value);
					}}
					className={	errors.recipients ? "inputError" : "" }
				></textarea>
				{errors.recipients && (
					<ul className="errorList">
						{errors.recipients.map((error, index) => (
							<li className="errorMessage" key={index} >{error}</li>
						))}
					</ul>
				)}
			</section>

			<section>
				<label htmlFor="amounts">
					Amounts: <br />
					(wei; comma or new line separated)
				</label>
				<textarea
					placeholder="1000000000000000000, 2000000000000000000"
					id="amounts"
					value={amounts}
					onChange={(event) => {
						handleAmountsChange(event.target.value);
					}}
					className={	errors.amounts ? "inputError" : "" }
				></textarea>
				{errors.amounts && (
					<ul className="errorList">
						{errors.amounts.map((error, index) => (
						<li className="errorMessage" key={index} >{error}</li>
						))}
					</ul>
				)}
			</section>

			<section className="totalDisplay">
				<p>Total amount:</p>
				<p className="amount">{ total }</p>
			</section>

			<button type="submit" disabled={isPending || Object.keys(errors).length > 0}>
				{isPending ? "Sending..." : "Send Tokens"}
			</button>
		</form>
	);
}

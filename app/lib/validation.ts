

/* Helper functions for validation of the form input */


// Validate single Ethereum address
export function isValidAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

// Parse and validate recepients list
export function parseAndValidateRecipients(input: string): { addresses: string[], errors: string[] } {
	const addresses = input
		.split(/[,\n]+/)
		.map(address => address.trim())
		.filter(address => address !== "")
	
	const errors: string[] = [];

	addresses.forEach((address, index) => {
		if (!isValidAddress(address)) {
			errors.push(`Recipient ${index + 1}: Invalid address format`)
		}
	})
	
	return { addresses, errors }
}

// Parse and validate amounts
export function parseAndValidateAmounts(input: string): {
	amounts: string[],
	errors: string[]
} {
	const amounts = input
		.split(/[,\n]+/)
		.map(amount => amount.trim())
		.filter(amount => amount !== "")

	const errors: string[] = []

	amounts.forEach((amount, index) => {
		if (!/^\d+$/.test(amount)) {
			errors.push(`Amount ${index + 1}: Must be a whole number (no decimals)`);
		}
		try {
			BigInt(amount)
		} catch (error) {
			errors.push(`Amount ${index + 1}: Number too large`)
		}
	})

	return { amounts, errors }
}

// Calculate total
export function calculateTotal(amounts: string[]): string {
	return amounts
		.reduce((sum, amount) => sum + BigInt(amount), BigInt(0))
		.toString()
}
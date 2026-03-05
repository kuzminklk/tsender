

/* Header with name and an «Connect Wallet» button from Rainbow-Kit */


import { ConnectButton } from "@rainbow-me/rainbowkit";


import "@rainbow-me/rainbowkit/styles.css"


export function Header(){
	return (
		<header>
			<h2>TSender</h2>
			<div>
				<ConnectButton />
			</div>
		</header>
	)
}
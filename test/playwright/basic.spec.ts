

// import { test, expect } from "@playwright/test"
import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";

import walletSetup from "@/test/wallet-setup/basic.setup"


const test = testWithSynpress(metaMaskFixtures(walletSetup))
const { expect } = test 


test("Has appropriate title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TSender/);
});


test("Should show «Connect a wallet» if there are no connection", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByText("Please connect a wallet")).toBeVisible()
})


test("Should show a form if there are connection", async ({ page, context, metamaskPage, extensionId }) => {
	await page.goto("/");
	await expect(page.getByText("Please connect a wallet")).toBeVisible()

	const metamask = new MetaMask(context, metamaskPage, walletSetup.walletPassword, extensionId)

	await page.getByTestId("rk-connect-button").click()
	await page.getByTestId("rk-wallet-option-io.metamask").waitFor({
		state: "visible",
		timeout: 60000
	})
	await page.getByTestId("rk-wallet-option-io.metamask").click()
	await metamask.connectToDapp()

	/*	const customNetwork = 	{
		name: "Anvil",
		rpcUrl: "http://127.0.0.1:8545",
		chainId: 31337,
		symbol: "ETH"
	} */

	await expect(page.getByText("Token Address")).toBeVisible()
})
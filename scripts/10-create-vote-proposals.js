import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

(async () => {
  try {
    // This is our governance contract.
    const vote = await sdk.getContract("0x5883De5502B98aDDB651eF0E95AA8bD9Da813cfC", "vote");
    // This is our ERC-20 contract.
    const token = await sdk.getContract("0xB2ad1Aa9Ff5c27858744F2B9A2a5ad5C67bf9a80", "token");
    // Create proposal to mint 420,000 new token to the treasury.
    const amount = 420_000;
    const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
    const executions = [
      {
        // Our token contract that actually executes the mint.
        toAddress: token.getAddress(),
        // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
        // to send in this proposal. In this case, we're sending 0 ETH.
        // We're just minting new tokens to the treasury. So, set to 0.
        nativeTokenValue: 0,
        // We're doing a mint! And, we're minting to the vote, which is
        // acting as our treasury.
        // in this case, we need to use ethers.js to convert the amount
        // to the correct format. This is because the amount it requires is in wei.
        transactionData: token.encoder.encode(
          "mintTo", [
          vote.getAddress(),
          ethers.utils.parseUnits(amount.toString(), 18),
        ]
        ),
      }
    ];

    await vote.propose(description, executions);

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    // This is our governance contract.
    const vote = await sdk.getContract("0x5883De5502B98aDDB651eF0E95AA8bD9Da813cfC", "vote");
    // This is our ERC-20 contract.
    //const token = await sdk.getContract("0xB2ad1Aa9Ff5c27858744F2B9A2a5ad5C67bf9a80", "token");
    // Create proposal to add a tool to the marketplace.
    let newTool = "New Tool";
    const description = "Should the DAO add " + newTool + " to the Miraculous Marketplace? ";
    let marketplaceTools = ["Tool 1", "Tool 2", "Tool 3"];
    const executions = marketplaceTools.push(newTool);
    ;

    await vote.propose(description, executions);

    console.log(
      "✅ Successfully created proposal to add an awesome new tool to the marketplace!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();
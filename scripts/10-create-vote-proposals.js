import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

(async () => {

  
  try {
    // This is our governance contract.
    const vote = await sdk.getContract("0x5883De5502B98aDDB651eF0E95AA8bD9Da813cfC", "vote");
    // This is our ERC-20 contract.
    const token = await sdk.getContract("0xB2ad1Aa9Ff5c27858744F2B9A2a5ad5C67bf9a80", "token");
    // Create proposal to transfer ourselves 5 tokens for being awesome.
    const newTool = "New Dev Tool";
    const description = "Should add " + newTool + " to the Miraculous Marketplace? ";
    const executions = console.log(newTool + " successfully added to the marketplace");
    await vote.propose(description, executions);

    console.log(
      "✅ Successfully created proposal to add New Dev Tool to the Marketplace, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create additional proposal", error);
  }
})();
// import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async () => {
  try {
    const editionDropAddress = await sdk.deployer.deployEditionDrop({
      // The collection's name,
      name: "MiraculousDAO Membership",
      // A description for the collection.
      description: "A DAO for Miraculous curators.",
      // The image that will be held on the membership NFT.
      image: readFileSync("scripts/assets/Miraculous_M_Placeholder.png"),
      // Passing the address of the entity that will be receiving the proceeds from sales of nfts in the contract.
      primary_sale_recipient: "0x3DB1a4fE4739668908E1C30D5150E729f0bFED50",
    });

    // this initialization returns the address of our contract
    // used to initialize the contract on the thirdweb sdk
    const editionDrop = await sdk.getContract(editionDropAddress, "edition-drop");

    // get the metadata of the contract
    const metadata = await editionDrop.metadata.get();

    console.log(
        "✅ Successfully deployed editionDrop contract, address:",
        editionDropAddress,
      );
      console.log("✅ editionDrop metadata:", metadata);
    } catch (error) {
      console.log("failed to deploy editionDrop contract", error);
    }
  })();
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async () => {
  try {
    const editionDrop = await sdk.getContract("0xA709A7b8F2275F8767bd7a2867Eca3dBB59a3f5c", "edition-drop");
    await editionDrop.createBatch([
      {
        name: "Next Gen Builder",
        description: "This NFT will give you access to MiraculousDAO!",
        image: readFileSync("scripts/assets/miraculous_member.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
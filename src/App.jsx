import { useAddress, ConnectWallet, Web3Button, useContract, useNFTBalance } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';

const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress();
  console.log("👋 Address:", address);
  // Initialize our Edition Drop contract
  const { contract: editionDrop } = useContract("0xA709A7b8F2275F8767bd7a2867Eca3dBB59a3f5c", "edition-drop");
  // Hook to check if the user has our NFT
  const { data: nftBalance } = useNFTBalance(editionDrop, address, "0")

  const hasClaimedNFT = useMemo(() => {
    return nftBalance && nftBalance.gt(0)
  }, [nftBalance])

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to MiraculousDAO ✨</h1>
        <div className="btn-hero">
          <ConnectWallet />
        </div>
      </div>
    );
  }
  
  // Add this little piece!
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>MiraculousDAO Member Page ✨</h1>
        <p>Congratulations on being a member</p>
      </div>
    );
  };

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free MiraculousDAO Membership NFT ✨</h1>
      <div className="btn-hero">
        <Web3Button 
          contractAddress={"0xA709A7b8F2275F8767bd7a2867Eca3dBB59a3f5c"}
          action={contract => {
            contract.erc1155.claim(0, 1)
          }}
          onSuccess={() => {
            console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
          }}
          onError={error => {
            console.error("Failed to mint NFT", error);
          }}
        >
          Mint your NFT (FREE)
        </Web3Button>
      </div>
    </div>
  );
}

export default App;
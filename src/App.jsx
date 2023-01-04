import { useWeb3Context } from '@web3-react/core';
import {
  useAddress,
  useNetwork,
  useContract,
  ConnectWallet,
  Web3Button,
  useNFTBalance,
} from '@thirdweb-dev/react';
import { ChainId } from '@thirdweb-dev/sdk';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from '@ethersproject/constants';



const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress();
  const network = useNetwork();
  console.log('👋 Address:', address);
  // Initialize our Edition Drop contract
  const editionDropAddress = '0xA709A7b8F2275F8767bd7a2867Eca3dBB59a3f5c';
  const { contract: editionDrop } = useContract(
    editionDropAddress,
    'edition-drop',
  );
  // Initialize our token contract
  const { contract: token } = useContract(
    '0xB2ad1Aa9Ff5c27858744F2B9A2a5ad5C67bf9a80',
    'token',
  );
  const { contract: vote } = useContract(
    '0x5883De5502B98aDDB651eF0E95AA8bD9Da813cfC',
    'vote',
  );

  const createProposal = async () => {
    try {
      // Send a transaction to the contract to create a proposal
      await vote.create(
        // The proposal description
        'Your proposal description',
        // The number of tokens needed to vote on this proposal
        '100',
        // The address of the token contract
        token.address,
        // The duration of the voting period in seconds
        '86400'
      );
      console.log('Proposal created successfully!');
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  // Hook to check if the user has our NFT
  const { data: nftBalance } = useNFTBalance(editionDrop, address, '0');

  const hasClaimedNFT = useMemo(() => {
    return nftBalance && nftBalance.gt(0);
  }, [nftBalance]);

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // A simple call to vote.getAll() to grab the proposals.
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll();
        setProposals(proposals);
        console.log('Proposals:', proposals);
      } catch (error) {
        console.log('failed to get proposals', error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);
  
  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
  
    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }
  
    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log('User has already voted!');
        } else {
          console.log('User has not voted yet!');
        }
      } catch (error) {
        console.error('Failed to check if wallet has voted', error);
      }
    };
    checkIfUserHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // This useEffect grabs all the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
  
    const getAllMembers = async () => {
      try {
        const members = await editionDrop.getAllMembers();
        setMemberAddresses(members);
        console.log('Members:', members);
        const memberTokenAmounts = [];
        for (const member of members) {
          const tokenAmount = await token.balanceOf(member);
          console.log('Token amount:', tokenAmount);
          memberTokenAmounts.push(tokenAmount);
        }
        setMemberTokenAmounts(memberTokenAmounts);
      } catch (error) {
        console.error('Error getting member addresses:', error);
      }
    };
    getAllMembers();
  }, [hasClaimedNFT, editionDrop, token]);
  
  return (
    <div>
      {/* Connect to a wallet using the thirdweb components */}
      <ConnectWallet
        title="Connect Wallet"
        titleConnecting="Connecting to Wallet"
        titleConnected="Connected to Wallet"
        description="Connect your Ethereum wallet to start voting."
        providerOptions={{
          walletconnect: {
            rpcUrl: 'https://mainnet.eth.aragon.network/',
          },
          }}
            >
              {/* Show a button to connect to a wallet */}
              <Web3Button />
            </ConnectWallet>
            {/* If the user is connected to a wallet, show them their address and the network they are on. */}
            {address && (
              <div>
                <h3>Your Wallet</h3>
                <p>
                  {shortenAddress(address)} on {network.name}
                </p>
                {/* If the user has our NFT, show them the voting options */}
                {hasClaimedNFT && (
                  <div>
                    <h3>Voting</h3>
                    {/* If there are no proposals, show a button to create one */}
                    {proposals.length && (
                      <div>
                        <button onClick={createProposal}>Create Proposal</button>
                      </div>
                    )}
                    {/* If there are proposals, show a form to vote on them */}
                    {proposals.length > 0 && (
                      <
                      form>
                      <h3>Proposals</h3>
                      {proposals.map((proposal, i) => (
                        <div key={i}>
                          <p>{proposal.name}</p>
                          <button
                            onClick={() => {
                              setIsVoting(true);
                              vote.vote(proposal.proposalId, true, {
                                gasLimit: 300000,
                              });
                            }}
                            disabled={isVoting || hasVoted}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => {
                              setIsVoting(true);
                              vote.vote(proposal.proposalId, false, {
                                gasLimit: 300000,
                              });
                            }}
                            disabled={isVoting || hasVoted}
                          >
                            No
                          </button>
                        </div>
                      ))}
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        );
        };
        
        export default App;
        
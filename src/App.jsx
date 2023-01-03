import React from 'react';
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
  
  // An array to hold our proposals
  const [proposals, setProposals] = useState([]);
  // A flag to indicate if the user is currently voting
  const [isVoting, setIsVoting] = useState(false);
  // A flag to indicate if the user has already voted
  const [hasVoted, setHasVoted] = useState(false);
  // An error message to display if there is a problem with the contract calls
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // A simple call to vote.getAll() to grab the proposals.
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAllProposals();
        setProposals(proposals);
        console.log('Proposals:', proposals);
      } catch (error) {
        console.log('failed to get proposals', error);
        setErrorMessage('Failed to retrieve proposals');
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
        setErrorMessage('Failed to check if user has voted');
      }
    };
    checkIfUserHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // Function to vote on a proposal
  const voteOnProposal = async (proposalId, voteType) => {
    // Set isVoting to true to disable the vote button
    setIsVoting(true);
    try {
      // Call the vote function in the contract
      await vote.vote(proposalId, voteType);
      // Update the hasVoted flag
      setHasVoted(true);
      // Display a success message
      setErrorMessage(`Successfully voted ${voteType} for proposal ${proposalId}`);
    } catch (error) {
      console.error('Failed to vote', error);
      // Display an error message
      setErrorMessage(`Failed to vote ${voteType} for proposal ${proposalId}`);
    }
    // Set isVoting to false to re-enable the vote button
    setIsVoting(false);
  };

  return (
    <div className="App">
      <ConnectWallet>
        {({ account, connected, error }) => {
                    if (error) {
                      return <div>Error: {error}</div>;
                    }
          
                    if (!connected) {
                      return (
                        <div>
                          <Web3Button networkId={ChainId.GOERLI} />
                          <p>Please connect to the Goerli network to use this app.</p>
                        </div>
                      );
                    }
          
                    if (connected && !account) {
                      return <div>Please unlock your wallet to use this app.</div>;
                    }
          
                    if (connected && account) {
                      return (
                        <div>
                          <p>Welcome, {shortenAddress(account)}!</p>
                          {errorMessage && <p>{errorMessage}</p>}
                          {hasClaimedNFT ? (
                            <div>
                              <h2>Proposals</h2>
                              <ul>
                                {proposals.map((proposal) => (
                                  <li key={proposal.proposalId}>
                                    {proposal.description}
                                    {!hasVoted && (
                                      <>
                                        <button
                                          disabled={isVoting}
                                          onClick={() =>
                                            voteOnProposal(proposal.proposalId, 'Yes')
                                          }
                                        >
                                          Yes
                                        </button>
                                        <button
                                          disabled={isVoting}
                                          onClick={() =>
                                            voteOnProposal(proposal.proposalId, 'No')
                                          }
                                        >
                                          No
                                        </button>
                                      </>
                                    )}
                                    {hasVoted && <p>You have already voted on this proposal</p>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p>You have not claimed your NFT yet</p>
                          )}
                        </div>
                      );
                    }
                  }}
                </ConnectWallet>
              </div>
            );
          };
          
          export default App;
          

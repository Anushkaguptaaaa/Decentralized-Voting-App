import { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {contractAbi, contractAddress} from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';
import './App.css';
import './Components/Connected.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true); // Force true initially for testing
  const [remainingTime, setremainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [CanVote, setCanVote] = useState(true);


  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return() => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    }
  }, []); // Only set up event listeners on mount

  useEffect(() => {
    if (isConnected) {
      getCandidates();
      getRemainingTime();
      // Temporarily commenting out getCurrentStatus to prevent auto-switching to "ended"
      // getCurrentStatus();
    }
  }, [isConnected]); // Only call these functions when connected


  async function vote() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );

      const tx = await contractInstance.vote(number);
      await tx.wait();
      canVote();
    } catch (error) {
      console.error("Error voting:", error);
      alert("Error voting: " + error.message);
    }
  }


  async function canVote() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const voteStatus = await contractInstance.voters(await signer.getAddress());
      setCanVote(voteStatus);
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  }

  async function getCandidates() {
    try {
      if (!window.ethereum) {
        console.log("MetaMask not detected");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const candidatesList = await contractInstance.getAllVotesOfCandiates();
      const formattedCandidates = candidatesList.map((candidate, index) => {
        return {
          index: index,
          name: candidate.name,
          voteCount: Number(candidate.voteCount)
        }
      });
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error("Error getting candidates:", error);
    }
  }


  async function getCurrentStatus() {
    try {
      if (!window.ethereum) {
        console.log("MetaMask not detected");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const status = await contractInstance.getVotingStatus();
      console.log("Voting status from contract:", status);
      console.log("Type of status:", typeof status);
      setVotingStatus(status);
    } catch (error) {
      console.error("Error getting voting status:", error);
      // If there's an error, assume voting is still active
      setVotingStatus(true);
    }
  }

  async function getRemainingTime() {
    try {
      if (!window.ethereum) {
        console.log("MetaMask not detected");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const time = await contractInstance.getRemainingTime();
      console.log("Remaining time from contract:", time);
      console.log("Remaining time as number:", Number(time));
      setremainingTime(Number(time));
    } catch (error) {
      console.error("Error getting remaining time:", error);
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected : " + address);
        setIsConnected(true);
        canVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser")
    }
  }

  async function handleNumberChange(e) {
    setNumber(e.target.value);
  }

  return (
    <div className="App">
      { votingStatus ? (isConnected ? (<Connected 
                      account = {account}
                      candidates = {candidates}
                      remainingTime = {remainingTime}
                      number= {number}
                      handleNumberChange = {handleNumberChange}
                      voteFunction = {vote}
                      showButton = {CanVote}
                      checkStatus = {getCurrentStatus}/>) 
                      
                      : 
                      
                      (<Login connectWallet = {connectToMetamask}/>)) : (<Finished />)}
      
    </div>
  );



}





export default App;
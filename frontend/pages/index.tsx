import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ethers } from 'ethers';
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';

import contractAbi from '../artifacts/contracts/Domains.sol/Domains.json';

const contractConfig = {
  addressOrName: "0x912f311780F3875c72dff0B02c534297EC53900B",
  contractInterface: contractAbi.abi,
};

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [price, setPrice] = useState('0.1');

  // https://github.com/vercel/next.js/discussions/35773 -> 🙂 smh
  useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected])

  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite({
    ...contractConfig, functionName: 'register',
    // overrides: { value: ethers.utils.parseEther('0.1') },
    overrides: { customData: [domain, ethers.utils.parseEther('0.1')] },
  });

  const {
    data: recordData,
    write: mintRecord,
    isLoading: isRecordLoading,
    isSuccess: isRecordStarted,
    error: recordError,
  } = useContractWrite({
    ...contractConfig, functionName: 'setRecord',
    overrides: { customData: [domain, record] },
  });

  const { data: totalSupplyData } = useContractRead({
    ...contractConfig,
    functionName: 'tld',
    watch: true,
    //overrides: { value: 'mortal' }
    //overrides: { customData: { name: 'mortal' } },
  });

  const { isSuccess: txSuccess, error: txError } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const isMinted = txSuccess;

  const tld = '.oli';

  useEffect(() => {
    if (totalSupplyData) {
      //setTotalMinted(totalSupplyData.toNumber());
      console.log(totalSupplyData);
    }
  }, [totalSupplyData]);

  const renderInputForm = () => {
    return (
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder='domain'
            onChange={e => setDomain(e.target.value)}
          />
          <p className='tld'> {tld} </p>
        </div>

        <input
          type="text"
          value={record}
          placeholder='whats ur ninja power'
          onChange={e => setRecord(e.target.value)}
        />

        <div className="button-container">
          <button className='cta-button mint-button' disabled={!domain} onClick={mintDomain}>
            Mint
          </button>
          <button className='cta-button mint-button' disabled={false} onClick={() => { }}>
            Set data
          </button>
        </div>

      </div>
    );
  }

  const mintDomain = async () => {
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long');
      return;
    }

    // Calculate price based on length of domain (change this to match your contract)	
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    setPrice(domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1');
    console.log("Minting domain", domain, "with price", price);


    try {
      // const provider = new ethers.providers.Web3Provider(ethereum);
      // const signer = provider.getSigner();
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

      console.log("Going to pop wallet now to pay gas...")
      //let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
      // Wait for the transaction to be mined
      mint();
      debugger;

      // Check if the transaction was successfully completed
      if (isMinted) {
        console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + mintData?.hash);
        // Set the record for the domain
        //tx = await contract.setRecord(domain, record);
        //await tx.wait();

        mintRecord();

        console.log("Record set! https://mumbai.polygonscan.com/tx/" + recordData?.hash);

        setRecord('');
        setDomain('');
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">🐱‍👤 Ninja Name Service</p>
              <p className="subtitle">Your immortal API on the blockchain!</p>
            </div>

            <ConnectButton />

            {isWalletConnected && renderInputForm()}
          </header>
        </div>
      </div>
    </div>
  );
}

export default Home

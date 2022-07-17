import { Button, Card, Container, Grid, Input, Loading, Spacer, Text } from "@nextui-org/react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';

import contractAbi from '../artifacts/contracts/Domains.sol/Domains.json';

const contractConfig = {
  addressOrName: "0x41B92873A081BAC4d154D0A28226fE13921910C8",
  contractInterface: contractAbi,
};

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [domains, setDomains] = useState(['o']);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [price, setPrice] = useState('0.1');

  // https://github.com/vercel/next.js/discussions/35773 -> 🙂 smh
  useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected])

  const {
    data: mintData,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    writeAsync: mint
  } = useContractWrite({
    ...contractConfig, functionName: 'register',
    overrides: { gasLimit: 1e7, value: ethers.utils.parseEther(price) },
    args: [domain]
  });

  const {
    write: mintRecord,
  } = useContractWrite({
    ...contractConfig, functionName: 'setRecord',
    args: [domain, record]
  });

  const { data: allDomains } = useContractRead({
    ...contractConfig,
    functionName: 'getAllNames',
    watch: true,
  });

  const { isSuccess: txSuccess, error: txError } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const isMinted = txSuccess;

  const tld = '.oli';

  useEffect(() => {
    console.log(allDomains);
    setDomains(allDomains as [])
  }, []);

  const renderInputForm = () => {
    return (
      <Container style={{ maxWidth: '500px' }}>
        <Card variant='bordered'>
          <Card.Body>
            <Input
              aria-label=''
              bordered
              labelLeft="domain:"
              labelRight={tld}
              onChange={e => onDomainChange(e.target.value)}
            />
            <Spacer y={1} />
            <Input
              aria-label=''
              bordered
              placeholder="Attach something to your address!"
              onChange={e => setRecord(e.target.value)}
            />
            <Spacer y={1} />
            <Button onClick={() => mintDomain()} disabled={domain.length < 3} shadow color="gradient" style={{ width: '200px' }} iconRight={isMintLoading && !isMinted && <Loading color="currentColor" size="sm" />}>
              {isMintLoading && 'Waiting for approval'}
              {isMintStarted && 'Minting...'}
              {!isMintLoading && !isMintStarted && 'Mint'}
            </Button>
          </Card.Body>
          <Card.Footer css={{ justifyItems: "flex-start" }}>
            <Text h4>Mint Price is {price}</Text>
          </Card.Footer>
        </Card>
      </Container>
    );
  }

  const onDomainChange = (domain: string) => {
    // Calculate price based on length of domain (change this to match your contract)	
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    setPrice(domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1');
    setDomain(domain);
  }

  const mintDomain = async () => {
    try {
      mint();
      mintRecord();
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Grid.Container gap={2} alignItems="center">
        <Grid xs={6} alignItems="center" direction='column'>
          <Text h1>🔌 Oli&apos;s Name Service</Text>
          <Text h3>Your immortal API on the blockchain!</Text>
        </Grid>

        <Grid xs={6} justify="flex-end">
          <ConnectButton />
        </Grid>
      </Grid.Container>

      {isWalletConnected && renderInputForm()}

      {domains.map(domain => {
        <Card css={{ mw: "400px" }}>
          <Card.Body>
            <Text>{domain}</Text>
          </Card.Body>
        </Card>
      })}
    </>
  );
}

export default Home

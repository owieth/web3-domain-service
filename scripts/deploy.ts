import { ethers } from "hardhat";

const main = async () => {
  const domainContractFactory = await ethers.getContractFactory('Domains');
  const domainContract = await domainContractFactory.deploy("oli");
  await domainContract.deployed();

  console.log("Contract deployed to:", domainContract.address);

  let txn = await domainContract.register("mortal", { value: ethers.utils.parseEther('0.1') });
  await txn.wait();

  const address = await domainContract.getAddress("mortal");
  console.log("Owner of domain mortal:", address);

  const balance = await ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", ethers.utils.formatEther(balance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

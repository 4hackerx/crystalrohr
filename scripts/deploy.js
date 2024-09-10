const hre = require("hardhat");
const { ethers } = require("hardhat");

// CREATE3 Factory address (same across all networks)
const CREATE3_FACTORY = "0x9fbda871d559710256a2502a2517b794b482db40";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Replace "YourContract" with your actual contract name
  const ContractFactory = await hre.ethers.getContractFactory("YourContract");

//   // Replace these with your actual constructor arguments
//   const arg1 = "First Argument";
//   const arg2 = 123;
//   const arg3 = "0x1234567890123456789012345678901234567890";

//   // Prepare the initialization code (contract bytecode + encoded constructor arguments)
//   const initCode = ContractFactory.getDeployTransaction(arg1, arg2, arg3).data;

  // Generate a unique salt (you can modify this to ensure the same address across networks)
  const salt = ethers.utils.id("YourUniqueIdentifier");
  const TokenContract = await ethers.getContractFactory("RohrToken");


  // Get the CREATE3 Factory contract
  const create3Factory = await ethers.getContractAt("ICREATE3Factory", CREATE3_FACTORY);

  // Deploy the contract using CREATE3
  const tx = await create3Factory.deploy(salt, TokenContract.bytecode);
  const receipt = await tx.wait();

  // Get the deployed contract address
  const deployedAddress = ethers.utils.getCreate3Address(CREATE3_FACTORY, salt);

  console.log("Contract deployed to:", deployedAddress);
  console.log("Transaction hash:", receipt.transactionHash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
const hre = require("hardhat");
const { ethers } = require("hardhat");
const crypto = require('crypto');

function generateSalt(inputString) {
    // Generate a random 16-byte buffer
    const randomBytes = crypto.randomBytes(16);
    
    // Combine the input string with the random bytes
    const saltBase = inputString + randomBytes.toString('hex');
    
    // Create a SHA-256 hash of the salt base
    const hash = crypto.createHash('sha256');
    hash.update(saltBase);
    
    // Get the hexadecimal representation of the hash
    const salt = ethers.getBytes(hash.digest('hex').slice(0,32));
    
    // Return the first 32 characters (16 bytes) of the hash
    return salt;
}

// Example usage
const userInput = "some_user_specific_data";


// CREATE3 Factory address (same across all networks)
const CREATE3_FACTORY = "0x9fbda871d559710256a2502a2517b794b482db40";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Replace "YourContract" with your actual contract name
  // const ContractFactory = await hre.ethers.getContractFactory("RohrToken");

//   // Replace these with your actual constructor arguments
//   const arg1 = "First Argument";
//   const arg2 = 123;
//   const arg3 = "0x1234567890123456789012345678901234567890";

//   // Prepare the initialization code (contract bytecode + encoded constructor arguments)
//   const initCode = ContractFactory.getDeployTransaction(arg1, arg2, arg3).data;

  // Generate a unique salt (you can modify this to ensure the same address across networks)

  function stringToBytes(str) {
    // Convert the string to bytes
    // const bytes = ethers.toUtf8Bytes(str);
    
    // Convert the bytes to a hex string
    const hexString = ethers.utils.toUtf8Bytes(str);
    
    // Pad the hex string to 32 bytes (64 characters) if necessary
    const paddedHexString = ethers.utils.hexlify(hexString);
    
    return paddedHexString;
}


  const salt =  stringToBytes("user");

  const TokenContract = await ethers.getContractFactory("RohrToken");
  console.log("generated salt",salt);

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
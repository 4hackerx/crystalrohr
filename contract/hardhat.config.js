require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
// RPC URLs
const ROOTSTOCK_TESTNET_RPC_URL = "https://public-node.testnet.rsk.co";
const FHENIX_TESTNET_RPC_URL = "https://api.helium.fhenix.zone";
const HEDERA_TESTNET_RPC_URL = "https://testnet.hashio.io/api";
const SEPOLIA_TESTNET_RPC_URL = "https://sepolia.infura.io/v3/";
module.exports = {
  solidity: "0.8.25",
  networks: {
    sepoliaTestnet:{
      url: SEPOLIA_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    rootstockTestnet: {
      url: ROOTSTOCK_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 31,
    },
    fhenixTestnet: {
      url: FHENIX_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 8008135,
    },
    hederaTestnet: {
      url: HEDERA_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 296,
    },
  },
};


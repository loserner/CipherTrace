import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";
import dotenv from "dotenv";

dotenv.config();

function getAccounts() {
  const pk = process.env.PRIVATE_KEY;
  const mnemonic = process.env.MNEMONIC;
  if (pk && pk.length > 0) {
    const normalized = pk.startsWith("0x") ? pk : `0x${pk}`;
    return [normalized];
  }
  if (mnemonic && mnemonic.trim().split(/\s+/).length >= 12) {
    const accountIndex = parseInt(process.env.ACCOUNT_INDEX || "0");
    const numAccounts = parseInt(process.env.NUM_ACCOUNTS || "1");
    const path = process.env.DERIVATION_PATH || "m/44'/60'/0'/0";
    return { mnemonic, path: path, initialIndex: accountIndex, count: numAccounts };
  }
  return [];
}

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    fhevm: {
      url: process.env.FHEVM_RPC_URL || "http://localhost:8545",
      accounts: getAccounts(),
      chainId: parseInt(process.env.FHEVM_CHAIN_ID || "1337"),
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: getAccounts(),
      chainId: 11155111,
    },
    testnet: {
      url: process.env.TESTNET_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: getAccounts(),
      chainId: parseInt(process.env.TESTNET_CHAIN_ID || "11155111"),
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      accounts: getAccounts(),
      chainId: parseInt(process.env.MAINNET_CHAIN_ID || "1"),
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

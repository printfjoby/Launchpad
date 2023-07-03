require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const SEPOLIA_API_KEY = process.env.SEPOLIA_API_KEY;
const OP_GOERLI_API_KEY = process.env.OP_GOERLI_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const OP_ETHERSCAN_API_KEY = process.env.OP_ETHERSCAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.18",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  paths: {
    artifacts: "./artifacts",
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    optimism_goerli: {
      url: `https://opt-goerli.g.alchemy.com/v2/${OP_GOERLI_API_KEY}`,
      accounts: [PRIVATE_KEY],
      gasPrice: 150000000
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      optimisticGoerli: OP_ETHERSCAN_API_KEY
    }
  }
};


require("./tasks/test");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@tenderly/hardhat-tenderly");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()

module.exports = {
  solidity: {
    version: '0.6.8',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    }
  },
  defaultNetwork: "bsc",
  networks: {
    rinkeby: {
      url: process.env.INFURA,
      chainId: 4,
      accounts: [process.env.PRIV_KEY]
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      gas: 4100000,
      // nonce:
      accounts: [process.env.PRIV_KEY]
    },
    tele: {
      url: "https://evm-rpc.testnet.teleport.network",
      chainId: 8001,
      accounts: [process.env.PRIV_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

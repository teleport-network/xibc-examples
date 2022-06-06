require("./tasks/test");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
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
    teleport: {
      url: "https://evm-rpc.testnet.teleport.network",
      chainId: 8001,
      accounts: [process.env.PRIV_KEY],
      hello: "hello"
    },
    arbitrum: {
      url: "https://rinkeby.arbitrum.io/rpc",
      chainId: 421611,
      accounts: [process.env.PRIV_KEY],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

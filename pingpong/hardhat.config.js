require("./tasks/test");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@tenderly/hardhat-tenderly");
require("@nomiclabs/hardhat-ethers");
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
  defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/401fd4a9e1ee481bb6138ebe3da95316",
      gasPrice: 30735455164,
      chainId: 4,
      // gas: 4100000,
      accounts: [process.env.PRIV_KEY]
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      // gasPrice: 63000000,
      chainId: 97,
      gas: 4100000,
      // nonce:
      accounts: [process.env.PRIV_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

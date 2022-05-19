// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require('dotenv').config()
let utils = require("../tasks/utils")

async function main() {

  // chain info
  let gasData = await hre.ethers.provider.getFeeData()
  const PingPongRC = await hre.ethers.getContractFactory("PingPongRC");



  let cts = utils.getChainContract(hre.network.name)

  // gasData.maxFeePerGas = gasData.maxFeePerGas.mul(50);
  // gasData.maxPriorityFeePerGas = gasData.maxPriorityFeePerGas.mul(50);
  // It's not clear that ether.js or Hardhat bugs cause nonce to be much larger than Minted TX.
  // Sometimes it occurs, so nonce reads from the chain can avoid problems.
  gasData.nonce = await hre.ethers.provider.getTransactionCount(process.env.PUBKEY)
  console.log("gasData", gasData)
  if (gasData.maxFeePerGas != null) {
    console.log("maxFeePerGas", hre.ethers.utils.formatUnits(gasData.maxFeePerGas, "gwei"), "gwei");
    console.log("maxPriorityFeePerGas", hre.ethers.utils.formatUnits(gasData.maxPriorityFeePerGas, "gwei"), "gwei")
    delete gasData.gasPrice
  } else {
    console.log("gas price", hre.ethers.utils.formatUnits(gasData.gasPrice, "gwei"), "gwei")
  }


  let ct = await PingPongRC.deploy(cts.rcc, gasData);
  console.log(ct.deployTransaction)
  console.log(await ct.deployTransaction.wait())
  console.log("network:", hre.network.name, "PingPongRC deployed to:", ct.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


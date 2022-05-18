// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require('dotenv').config()

async function main() {

  // chain info
  console.log(await hre.ethers.provider.getTransactionCount("0x7e01879e94241c8A022Cb6708C7F241f86039Ff6"))
  let gasData = await hre.ethers.provider.getFeeData()
  console.log("gasData", gasData)
  console.log("gasPrice", hre.ethers.utils.formatUnits(gasData.gasPrice, "gwei"), "gwei");

  const PingPongRC = await hre.ethers.getContractFactory("PingPongRC");
  let ct;
  if (hre.network.name === 'bsc') {
    ct = await PingPongRC.deploy(process.env.BSC_RCC_ADDRESS, gasData);
    await ct.deployed();
  } else {
    ct = await PingPongRC.deploy(process.env.TELE_RCC_ADDRESS, gasData);
    await ct.deployed();
  }


  console.log("network:", hre.network.name, "PingPongRC deployed to:", ct.address);
  // await hre.tenderly.persistArtifacts({
  //   name: "PingPongRC",
  //   address: ct.address,
  // })

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


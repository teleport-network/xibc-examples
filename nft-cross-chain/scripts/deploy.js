
const hre = require("hardhat");
require('dotenv').config()
let utils = require("../tasks/utils")

async function main() {

    // chain info
    let gasData = await hre.ethers.provider.getFeeData()
    const CC721 = await hre.ethers.getContractFactory("CC721");



    let cts = utils.getChainContract(hre.network.name)

    // gasData.maxFeePerGas = gasData.maxFeePerGas.mul(50);
    // gasData.maxPriorityFeePerGas = gasData.maxPriorityFeePerGas.mul(50);
    // It's not clear that ether.js or Hardhat bugs cause nonce to be much larger than Minted TX.
    // Sometimes it occurs, so nonce reads from the chain can avoid problems.
    gasData.nonce = await hre.ethers.provider.getTransactionCount(await (await hre.ethers.getSigner()).getAddress())
    console.log("gasData", gasData)
    if (gasData.maxFeePerGas != null) {
        console.log("maxFeePerGas", hre.ethers.utils.formatUnits(gasData.maxFeePerGas, "gwei"), "gwei");
        console.log("maxPriorityFeePerGas", hre.ethers.utils.formatUnits(gasData.maxPriorityFeePerGas, "gwei"), "gwei")
        delete gasData.gasPrice
    } else {
        console.log("gas price", hre.ethers.utils.formatUnits(gasData.gasPrice, "gwei"), "gwei")
    }


    let ct = await CC721.deploy(cts.rcc, gasData);
    console.log(await ct.deployTransaction.wait())
    console.log("network:", hre.network.name, "CC721 deployed to:", ct.address)
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


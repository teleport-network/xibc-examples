const { deploy } = require("./utils")
require('dotenv').config()

async function main() {

    // deploy CrossChainSwap
    // let ccSwap = await deploy('CrossChainSwap', {})
    // let receipt = await ccSwap.wait()
    // console.log("tx", ccSwap)
    // console.log("receipt", receipt)




    // tx attributes warp
    let txWrap = await hre.ethers.provider.getFeeData()
    // txWrap.maxFeePerGas = txWrap.maxFeePerGas.mul(50)
    // txWrap.maxPriorityFeePerGas = txWrap.maxPriorityFeePerGas.mul(50)
    // It's not clear that ether.js or Hardhat bugs cause nonce to be much larger than Minted TX.
    // Sometimes it occurs, so nonce reads from the chain can avoid problems.
    txWrap.nonce = await hre.ethers.provider.getTransactionCount(await ((await hre.ethers.getSigners())[0]).getAddress())
    console.log("txWrap", txWrap)
    if (txWrap.maxFeePerGas != null) {
        console.log("maxFeePerGas", hre.ethers.utils.formatUnits(txWrap.maxFeePerGas, "gwei"), "gwei")
        console.log("maxPriorityFeePerGas", hre.ethers.utils.formatUnits(txWrap.maxPriorityFeePerGas, "gwei"), "gwei")
        delete txWrap.gasPrice
    } else {
        console.log("gas price", hre.ethers.utils.formatUnits(txWrap.gasPrice, "gwei"), "gwei")
    }

    // deploy
    const factory = await hre.ethers.getContractFactory('CrossChainSwap')
    let ct = await factory.deploy(txWrap);
    let receipt = ct.deployTransaction.wait()
    console.log("ct", ct)
    console.log("receipt", receipt)
    console.log("network:", hre.network.name, 'CrossChainSwap' + " deployed to:", ct.address)



}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })


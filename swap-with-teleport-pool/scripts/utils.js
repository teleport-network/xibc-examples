function getChainContract(networkName) {
    ans = {}
    switch (networkName) {
        case 'teleport':
            ans.swap = process.env.TELE_SWAP
            ans.rcc = process.env.TELE_RCC_ADDRESS
            ans.packet = process.env.TELE_PACKET_ADDRESS
            break
        case 'bsc':
            ans.swap = process.env.BSC_SWAP
            ans.rcc = process.env.BSC_RCC_ADDRESS
            ans.packet = process.env.BSC_PACKET_ADDRESS
            break
        case 'rinkeby':
            ans.swap = process.env.RIN_SWAP
            ans.rcc = process.env.RIN_RCC_ADDRESS
            ans.packet = process.env.RIN_PACKET_ADDRESS
            break
        case 'localhost':
        case 'arbitrum':
            ans.swap = process.env.ARB_SWAP
            ans.rcc = process.env.ARB_RCC_ADDRESS
            ans.packet = process.env.ARB_PACKET_ADDRESS
            break
        default:
            console.log("unsupport network")
            process.exit()
    }
    return ans
}
async function deploy(name, args) {

    // tx attributes warp
    let txWrap = await hre.ethers.provider.getFeeData()
    // txWrap.maxFeePerGas = txWrap.maxFeePerGas.mul(50)
    // txWrap.maxPriorityFeePerGas = txWrap.maxPriorityFeePerGas.mul(50)
    // It's not clear that ether.js or Hardhat bugs cause nonce to be much larger than Minted TX.
    // Sometimes it occurs, so nonce reads from the chain can avoid problems.
    txWrap.nonce = await hre.ethers.provider.getTransactionCount(await (await hre.ethers.getSigners()[0]).getAddress())
    console.log("txWrap", txWrap)
    if (txWrap.maxFeePerGas != null) {
        console.log("maxFeePerGas", hre.ethers.utils.formatUnits(txWrap.maxFeePerGas, "gwei"), "gwei")
        console.log("maxPriorityFeePerGas", hre.ethers.utils.formatUnits(txWrap.maxPriorityFeePerGas, "gwei"), "gwei")
        delete txWrap.gasPrice
    } else {
        console.log("gas price", hre.ethers.utils.formatUnits(txWrap.gasPrice, "gwei"), "gwei")
    }

    // deploy
    const factory = await hre.ethers.getContractFactory(name)
    let ct = await factory.deploy(...args, txWrap);
    // console.log(ct.deployTransaction)
    console.log(await ct.deployTransaction.wait())
    console.log("network:", hre.network.name, name + " deployed to:", ct.address)

    return ct

}

module.exports = { getChainContract, deploy }
function getChainContract(networkName) {
    ans = {}
    switch (networkName) {
        case 'tele':
            ans.cc721 = process.env.TELE_CC721
            ans.rcc = process.env.TELE_RCC_ADDRESS
            ans.packet = process.env.TELE_PACKET_ADDRESS
            break
        case 'bsc':
            ans.cc721 = process.env.BSC_CC721
            ans.rcc = process.env.BSC_RCC_ADDRESS
            ans.packet = process.env.BSC_PACKET_ADDRESS
            break
        case 'rinkeby':
            ans.cc721 = process.env.RIN_CC721
            ans.rcc = process.env.RIN_RCC_ADDRESS
            ans.packet = process.env.RIN_PACKET_ADDRESS
            break
        case 'arb':
            ans.rcc = process.env.ARB_RCC_ADDRESS
            ans.packet = process.env.ARB_PACKET_ADDRESS
            break
        default:
            console.log("unsupport network")
            process.exit()
    }
    return ans
}
function deploy(name, args) {

    // tx attributes warp
    let txWrap = await hre.ethers.provider.getFeeData()
    // txWrap.maxFeePerGas = txWrap.maxFeePerGas.mul(50)
    // txWrap.maxPriorityFeePerGas = txWrap.maxPriorityFeePerGas.mul(50)
    // It's not clear that ether.js or Hardhat bugs cause nonce to be much larger than Minted TX.
    // Sometimes it occurs, so nonce reads from the chain can avoid problems.
    txWrap.nonce = await hre.ethers.provider.getTransactionCount(await(await hre.ethers.getSigner()).getAddress())
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

    return ct.address

}

module.exports = { getChainContract, deploy }
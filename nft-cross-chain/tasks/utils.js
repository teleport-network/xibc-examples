

function getChainContract(networkName) {
    ans = {}
    switch (networkName) {
        case 'teleport':
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
        case 'arbitrum':
            ans.cc721 = process.env.ARB_CC721
            ans.rcc = process.env.ARB_RCC_ADDRESS
            ans.packet = process.env.ARB_PACKET_ADDRESS
            break
        default:
            console.log("unsupport network")
            process.exit()
    }
    return ans
}

module.exports = { getChainContract }


function getChainContract(networkName) {
    ans = {}
    switch (networkName) {
        case 'tele':
            ans.pingpong = process.env.TELE_PINGPONG
            ans.rcc = process.env.TELE_RCC_ADDRESS
            ans.packet = process.env.TELE_PACKET_ADDRESS
            break
        case 'bsc':
            ans.pingpong = process.env.BSC_PINGPONG
            ans.rcc = process.env.BSC_RCC_ADDRESS
            ans.packet = process.env.BSC_PACKET_ADDRESS
            break
        case 'rinkeby':
            ans.pingpong = process.env.RIN_PINGPONG
            ans.rcc = process.env.RIN_RCC_ADDRESS
            ans.packet = process.env.RIN_PACKET_ADDRESS
            break
        default:
            console.log("unsupport network")
            process.exit()
    }
    return ans
}

module.exports = { getChainContract }
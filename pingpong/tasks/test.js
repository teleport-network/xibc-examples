/*
 * @Descripttion: 
 * @version: 
 * @Author: zsl
 * @Date: 2022-04-29 11:57:42
 */

require("../hardhat.config");

let PingPongRCAddr = ""
PingPongRCAddr = process.env.PingPongRCAddr


let targetChain = "teleport"
// teleport
// bsc-testnet
// rinkeby


task("callRemotePing", "callRemotePing")
    // .addParam("target", "counterpart target contract address")
    // .addParam("destchain", "")
    // .addParam("relaychain", "")
    // .addParam("feeaddr", "")
    // .addParam("feeamount", "")
    .setAction(async (args, hre) => {
        let feedata = await ethers.provider.getFeeData()
        const factory = await hre.ethers.getContractFactory('PingPongRC')
        let ct;

        // 全部重新部署
        PingPongRCAddr = ""
        if (PingPongRCAddr === '') {
            ct = await factory.deploy(process.env.RCC_ADDRESS);
            await ct.deployed();
        } else {
            ct = await factory.attach(String(PingPongRCAddr));
        }

        feedata.value = 1000;
        feedata.gasLimit = 5000000;
        delete feedata.gasPrice;
        console.log(feedata)

        const result = await ct.callRemotePing(
            '0x50E7134468C9b25a4403EC06594741b73361C3E3',
            targetChain,
            '',
            hre.ethers.constants.AddressZero,
            1000,
            feedata);
        console.log("call complete")
        console.log(await result.wait())
    })

module.exports = {}

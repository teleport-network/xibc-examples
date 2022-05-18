/*
 * @Descripttion: 
 * @version: 
 * @Author: zsl
 * @Date: 2022-04-29 11:57:42
 */

require("../hardhat.config");





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

        if (process.env.BSC_PINGPONG === '') {
            ct = await factory.deploy(process.env.RCC_ADDRESS);
            await ct.deployed();
        } else {
            ct = await factory.attach(String(process.env.BSC_PINGPONG));
        }

        feedata.value = hre.ethers.utils.parseUnits("0", "gwei");
        feedata.gasLimit = 5000000;
        console.log("feedata", feedata)


        // method args
        let callArgs = [
            process.env.TELE_PINGPONG,//target contract addr
            process.env.TARGET_CHAIN, //target chain
            '',                       // relay chain
            hre.ethers.constants.AddressZero, // fee address
            feedata.value,]
        console.log("call args", callArgs)                           // 
        const result = await ct.callRemotePing(
            ...callArgs,
            feedata);
        let receipt = await result.wait()
        console.log("receipt", receipt)

    })

// task for get packge event from x block
task("getSendPacketEvent", "")
    .addParam("block", "")
    .setAction(async (args, hre) => {
        console.log(args)
        let factory = await hre.ethers.getContractFactory("Packet")
        let ct = factory.attach(process.env.PACKET_ADDRESS)
        let logs = await ct.queryFilter(ct.filters.PacketSent(), parseInt(args.block))
        console.log("packetsend logs num:", logs.length)
        logargs = logs[0].args[0]
        console.log("sequence", logargs.sequence.toString());
        console.log("sourceChain", logargs.sourceChain)
        console.log("destChain", logargs.destChain)
        console.log("relayChain", logargs.relayChain)
        console.log("ports", logargs.ports)
    })



module.exports = {}

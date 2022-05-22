

require("../hardhat.config");
let utils = require("./utils")



// Call callRemotePing for the current chain 
// notice: you need to approve your token to package contract when you set feeaddr address not equal to 0x
task("callRemotePing", "callRemotePing")
    .addParam("destchain", "")
    .addParam("relaychain", "")
    .addParam("feeaddr", "relay fee token address.give 0x if using native token")
    .addParam("feeamount", "fee amount,using ether unit,can be decimals like 0.00001 or 1 etc")
    .setAction(async (args, hre) => {


        let txCfg = await ethers.provider.getFeeData()
        txCfg.nonce = await hre.ethers.provider.getTransactionCount(process.env.PUBKEY)
        // @notice The multiplier is different in different networks; 50 is the value under rinkeby.
        // txCfg.maxFeePerGas = txCfg.maxFeePerGas.mul(50);
        // txCfg.maxPriorityFeePerGas = txCfg.maxPriorityFeePerGas.mul(50);
        if (txCfg.maxFeePerGas != null) {
            delete txCfg.gasPrice
        }
        const factory = await hre.ethers.getContractFactory('PingPongRC')
        let cts = utils.getChainContract(hre.network.name)

        let ct = await factory.attach(cts.pingpong);


        if (args.feeaddr === '0x') {
            txCfg.value = hre.ethers.utils.parseUnits(args.feeamount, "ether");
        }

        txCfg.gasLimit = 20000000;
        console.log("txCfg", txCfg)


        let contracts = utils.getChainContract(hre.network.name)

        let callArgs = [
            cts.pingpong,
            args.destchain,
            args.relaychain,
            args.feeaddr === '0x' ? hre.ethers.constants.AddressZero : args.feeaddr,
            args.feeamount,]

        console.log("call args", callArgs)                           // 
        const result = await ct.callRemotePing(
            ...callArgs,
            txCfg);
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


// task to check if telechain get the bsc rcc call
task("getReceived", "")
    .addParam("index", "ping sequence indicator")
    .setAction(async (args, hre) => {
        let factory = await hre.ethers.getContractFactory("PingPongRC")
        let cts = utils.getChainContract(hre.network.name)
        console.log('cts', cts)
        let ct = factory.attach(cts.pingpong)
        console.log("received:", await ct.received(args.index))
    })

task("parse","")
.setAction(async (args, hre) => {
    // 0x381e25efbdbfefa597f65a36160668913f41ea66f628c29d9960717c1aea10aa
    let ans = await hre.provider.getTransactionReceipt("0x381e25efbdbfefa597f65a36160668913f41ea66f628c29d9960717c1aea10aa")
    // decode 



})


module.exports = {}

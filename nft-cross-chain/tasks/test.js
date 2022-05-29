let utils = require("./utils")


task("crosschain", "call crosschain")
    .addParam("id", "nft id")
    .addParam("destchain", "")
    .addParam("relaychain", "")
    .addParam("feeaddr", "relay fee token address.give 0x if using native token")
    .addParam("feeamount", "fee amount,using ether unit,can be decimals like 0.00001 or 1 etc")
    .setAction(async (args, hre) => {


        let txCfg = await ethers.provider.getFeeData()
        txCfg.nonce = await hre.ethers.provider.getTransactionCount((new ethers.Wallet(process.env.PRIV_KEY)).address)
        // @notice The multiplier is different in different networks; 50 is the value under rinkeby.
        // txCfg.maxFeePerGas = txCfg.maxFeePerGas.mul(50);
        // txCfg.maxPriorityFeePerGas = txCfg.maxPriorityFeePerGas.mul(50);
        if (txCfg.maxFeePerGas != null) {
            delete txCfg.gasPrice
        }
        const factory = await hre.ethers.getContractFactory('CC721')
        let cts = utils.getChainContract(hre.network.name)

        let ct = await factory.attach(cts.cc721);


        if (args.feeaddr === '0x') {
            txCfg.value = hre.ethers.utils.parseUnits(args.feeamount, "ether");
        }

        txCfg.gasLimit = 20000000;
        console.log("txCfg", txCfg)


        let callArgs = [
            cts.cc721,
            args.destchain,
            args.relaychain,
            args.feeaddr === '0x' ? hre.ethers.constants.AddressZero : args.feeaddr,
            args.feeamount,]

        console.log("call args", callArgs)                           // 
        const result = await ct.crossChain(
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

task("hardhatWork", "test if hardhatwork on one chain likes bsc, rinkeby...")
    .setAction(async (args, hre) => {
        console.log("test network", hre.network.name)
        console.log(await hre.ethers.provider.getBlockNumber())
    })
module.exports = {}

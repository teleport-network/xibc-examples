let utils = require("./utils")


task("crosschain", "call crosschain")
    .addParam("id", "nft id")
    .addParam("destchain", "")
    .addParam("relaychain", "")
    .addParam("receiver", "")
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
        let targetCts = utils.getChainContract(args.destchain)
        let ct = await factory.attach(cts.cc721);


        if (args.feeaddr === '0x') {
            txCfg.value = hre.ethers.utils.parseUnits(args.feeamount, "ether");
        }

        txCfg.gasLimit = 20000000;
        console.log("txCfg", txCfg)


        let callArgs = [
            args.id,
            targetCts.cc721,
            args.destchain,
            args.relaychain,
            args.feeaddr === '0x' ? hre.ethers.constants.AddressZero : args.feeaddr,
            txCfg.value,
            args.receiver
        ]

        console.log("call args", callArgs)                           // 
        const result = await ct.crossChain(
            ...callArgs,
            txCfg);
        let receipt = await result.wait()
        console.log("receipt", receipt)

    })

task("latestMint", "")
    .setAction(async (args, hre) => {
        let fa = await hre.ethers.getContractFactory("CC721")
        let cts = utils.getChainContract(hre.network.name)
        let ct = await fa.attach(cts.cc721)
        let latestMint = await ct.latestMint()
        console.log("latestIn:", latestMint)
        console.log("origin info:", await ct.enter(latestMint))

    })

task("mint", "mint nft to your address that you send tx")
    .setAction(async (args, hre) => {
        const [signer] = await ethers.getSigners();
        let fa = await hre.ethers.getContractFactory('CC721')
        let cts = utils.getChainContract(hre.network.name)
        let ct = await fa.attach(cts.cc721)
        let tx = await ct.safeMint(signer.address);
        let receipt = await tx.wait();

        console.log(tx)
        console.log(receipt)

        console.log(receipt.events)
        receipt.events.forEach((v, i, arr) => {
            console.log("eventSig:", v.eventSignature)
            console.log(v.args)
            console.log("\n\n\n")
        })

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

task("queryReceipt", "query recipt")
    // .addParam("packet", "packet address")
    .addParam("sourcechain", "sourceChain")
    .addParam("destchain", "sourceChain")
    .addParam("sequence", "sourceChain")
    .setAction(async (taskArgs, hre) => {
        const packetFactory = await hre.ethers.getContractFactory('Packet')
        let cts = utils.getChainContract(hre.network.name)
        const packet = await packetFactory.attach(cts.packet)
        let key = taskArgs.sourcechain + "/" + taskArgs.destchain + "/" + taskArgs.sequence
        let packetRec = await packet.receipts(Buffer.from(key, "utf-8"))
        console.log("receipted:", packetRec)
    })

task("hardhatWork", "test if hardhatwork on one chain likes bsc, rinkeby...")
    .setAction(async (args, hre) => {
        console.log("test network", hre.network.name)
        console.log(await hre.ethers.provider.getBlockNumber())
    })

task('owner', '')
    .addParam('id', '')
    .setAction(async (args, hre) => {
        let cts = await utils.getChainContract(hre.network.name)
        let nft = await hre.ethers.getContractAt('CC721', cts.cc721)
        console.log(await nft.ownerOf(args.id))
    })

module.exports = {}

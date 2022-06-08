let utils = require("../scripts/utils")


task("remoteSwap", "call crosschain")
    .setAction(async (args, hre) => {
        let txCfg = await ethers.provider.getFeeData()
        let [signer] = await hre.ethers.getSigners();
        txCfg.nonce = await hre.ethers.provider.getTransactionCount(signer.address)



        // @notice The multiplier is different in different networks; 50 is the value under rinkeby.
        // txCfg.maxFeePerGas = txCfg.maxFeePerGas.mul(50);
        // txCfg.maxPriorityFeePerGas = txCfg.maxPriorityFeePerGas.mul(50);
        if (txCfg.maxFeePerGas != null) {
            delete txCfg.gasPrice
        }
        let cts = utils.getChainContract(hre.network.name)

        // transfer usdt to workcontract
        let usdtFa = await hre.ethers.getContractFactory('ERC20')
        let usdt = usdtFa.attach('0x2436de6b227eefc84245260f74f096136b217093')
        console.log("usdt transfer", await (await usdt.transfer(cts.swap, hre.ethers.utils.parseUnits("31")
        )).wait())



        // call remoteSwap
        txCfg.nonce = await hre.ethers.provider.getTransactionCount((new ethers.Wallet(process.env.PRIV_KEY)).address)
        const factory = await hre.ethers.getContractFactory('CrossChainSwap')
        let ct = await factory.attach(cts.swap);


        if (args.feeaddr === '0x') {
            txCfg.value = hre.ethers.utils.parseUnits(args.feeamount, "ether");
        }

        txCfg.gasLimit = 20000000;
        console.log("txCfg", txCfg)


        let callArgs = []

        console.log("call args", callArgs)
        const tx = await ct.remoteSwap(
            ...callArgs,
            txCfg);
        let receipt = await tx.wait()
        // console.log("receipt", receipt)
        console.log(receipt.events[8])
        // parse packet event
        let packetFa = await hre.ethers.getContractFactory('Packet')
        console.log(packetFa.interface.decodeEventLog("PacketSent", receipt.events[8].data, receipt.events[8].topics))

    })

task("latestIn", "")
    .setAction(async (args, hre) => {
        let fa = await hre.ethers.getContractFactory("CC721")
        let cts = utils.getChainContract(hre.network.name)
        let ct = await fa.attach(cts.cc721)
        console.log("latestIn:", await ct.latestIn())

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


module.exports = {}

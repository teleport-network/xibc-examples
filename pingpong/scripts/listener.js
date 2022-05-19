
const hre = require("hardhat")
const utils = require("../tasks/utils")
async function main() {
    let packetFactory = await hre.ethers.getContractFactory("Packet")
    let cts = utils.getChainContract(hre.network.name)
    let packetCt = packetFactory.attach(cts.packet)
    let pingpongFactory = await hre.ethers.getContractFactory("PingPongRC")
    let pingpongCt = pingpongFactory.attach(cts.pingpong)
    console.log("start listen PacketSent:", cts.packet)
    console.log("start listen AckPacket:", cts.packet)
    console.log("start listen RccPing:", cts.rcc)
    packetCt.on("PacketSent", (packet) => {
        console.log("\n===============enter PacketSent ==================")
        console.log("sequence", packet.sequence)
        console.log("sequence", packet.sequence.toString())
        console.log("sourceChain", packet.sourceChain)
        console.log("destChain", packet.destChain)
        console.log("relayChain", packet.relayChain)
        console.log("ports", packet.ports)

        console.log("===============end PacketSent ==================\n")
    })


    packetCt.on("AckPacket", (packet, acknowledgement) => {
        console.log("\n===============enter AckPacket ==================")
        console.log(packet, acknowledgement)
        console.log("===============end AckPacket ==================\n")
    })

    pingpongCt.on("RccPing", (index) => {
        console.log("\n===============enter RccPing ==================")
        console.log("ping index:", index.toString());
        console.log("===============end RccPing ==================\n")
    })

}


main()

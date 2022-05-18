
const hre = require("hardhat")

async function main() {
    let packetFactory = await hre.ethers.getContractFactory("Packet")
    let packetCt = packetFactory.attach(process.env.BSC_PACKET_ADDRESS)
    let pingpongFactory = await hre.ethers.getContractFactory("PingPongRC")
    let pingpongCt = pingpongFactory.attach(process.env.BSC_PINGPONG)
    console.log("start lesten:", process.env.BSC_PACKET_ADDRESS, "(packet contract))", "for PacketSent")
    packetCt.on("PacketSent", (packet) => {
        console.log("===============enter PacketSent ==================")
        console.log(packet.sequence.toString())
        console.log(packet.sourceChain)
        console.log(packet.destChain)
        console.log(packet.relayChain)
        console.log(packet.ports)

        console.log("===============end PacketSent ==================")
    })


    packetCt.on("AckPacket", (packet, acknowledgement) => {
        console.log("===============enter AckPacket ==================")
        console.log(packet, acknowledgement)
        console.log("===============end AckPacket ==================")
    })

    pingpongCt.on("RccPing", (index) => {
        console.log("===============enter RccPing ==================")
        console.log("ping index:", index.toString());
        console.log("===============end RccPing ==================")
    })

}


main()

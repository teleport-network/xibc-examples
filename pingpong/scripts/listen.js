
const hre = require("hardhat")

async function main() {
    let factory = await hre.ethers.getContractFactory("Packet")
    let ct = factory.attach("0xc8685bbdac12471ca895f3fb200da600e379cbe4")

    console.log("start lesten:", "0xc8685bbdac12471ca895f3fb200da600e379cbe(packet contract))", "for PacketSent")
    ct.on("PacketSent", (packet) => {
        console.log("===============enter PacketSent ==================")
        // console.log(packet)
        console.log(packet.sequence)
        console.log(packet.sourceChain)
        console.log(packet.destChain)
        console.log(packet.relayChain)
        console.log(packet.ports)
        
        console.log("===============end PacketSent ==================")
    })



    ct.on("AckPacket", (packet, acknowledgement) => {
        console.log("===============enter AckPacket ==================")
        console.log(packet, acknowledgement)

        console.log("===============end AckPacket ==================")
    })

    
}

// struct Packet {
//     uint64 sequence;
//     string sourceChain;
//     string destChain;
//     string relayChain;
//     string[] ports;
//     bytes[] dataList;
// }

main()

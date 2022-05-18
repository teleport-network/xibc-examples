/*
 * @Descripttion: 
 * @version: 
 * @Author: zsl
 * @Date: 2022-05-17 16:43:41
 */

const hre = require("hardhat")

async function main() {
    let factory = await hre.ethers.getContractFactory("PingPongRC")
    let ct = factory.attach(process.env.TELE_PINGPONG)

    console.log("start lesten:", process.env.TELE_PINGPONG, "(PingPongRC contract))", "for Success")
    ct.on("Success", (success) => {
        console.log("===============enter PingPong ==================")
        // console.log(packet)
        console.log(success)

        console.log("===============end PingPong ==================")
    })

}


main()

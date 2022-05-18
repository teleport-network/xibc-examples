/*
 * @Descripttion: 
 * @version: 
 * @Author: zsl
 * @Date: 2022-05-18 15:00:51
 */
/*
 * @Descripttion: 
 * @version: 
 * @Author: zsl
 * @Date: 2022-04-29 11:57:42
 */




// task to check if telechain get the bsc rcc call
task("getReceived", "")
    .addParam("index", "ping sequence indicator")
    .setAction(async (args, hre) => {
        let factory = await hre.ethers.getContractFactory("PingPongRC")
        let ct = factory.attach(process.env.TELE_PINGPONG)
        console.log("received:", await ct.received(args.index))
    })

module.exports = {}

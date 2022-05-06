/*
 * @Descripttion: 
 * @version: 
 * @Author: zsl
 * @Date: 2022-04-29 11:57:42
 */
// import { task } from "hardhat/config"
require("@nomiclabs/hardhat-web3");

let PingPongRCAddr = ""
PingPongRCAddr = process.env.PingPongRCAddr
task("callRemotePing", "callRemotePing")
    .addParam("target", "counterpart target contract address")
    .addParam("destchain", "")
    .addParam("relaychain", "")
    .addParam("feeaddr", "")
    .addParam("feeamount", "")
    .setAction(async (args, hre) => {
        console.log("args", args);
        if (PingPongRCAddr == "") {
            console.error("PingPongRCAddr is empty");
        }
        const factory = await hre.ethers.getContractFactory('PingPongRC')
        let ct;
        if (!Boolean(PingPongRCAddr)) {
            ct = await factory.deploy("0x728fd3ae64930f98998d52ed4f79dcd5b0773c09");
        } else {
            ct = await factory.attach(String(PingPongRCAddr));
        }
        console.log("call")
        const result = await ct.callRemotePing(args.target, args.destChain, args.relayChain, args.feeAddr, args.feeAmount, { value: args.feeAmount });
        console.log("call complete")
        console.log(await result.wait())

    })

module.exports = {}


// export PingPongRCAddr=0x6BdEAFF9e58c0C8367b05b9F5ce4F04d096234AF
// yarn hardhat callRemotePing --target "0x50E7134468C9b25a4403EC06594741b73361C3E3" --destchain "bsc-testnet" --relaychain "" --feeaddr "0x0000000000000000000000000000000000000000" --feeamount 100000 --network rinkeby


// contract addr
// 0x7031AF3D1C4f7c07f41d246288C59A88A66C6445
// debug tx 
// 0x64ffa32b785c94e48a9e71a6c11e077715556bd1fd6a8b26a462f341a1f0350d
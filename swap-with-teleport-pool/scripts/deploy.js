
const hre = require("hardhat")
const { deploy } = require("./utils")
require('dotenv').config()
// let utils = require("../tasks/utils")
require('./utils')

async function main() {


     //deploy swap
     // args[0] is router address
     let swap = deploy('Swap',["0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"])
     // deploy agent
    deploy('Agent',)
    // deploy CrossChainSwap
    deploy('CrossChainSwap',)
    
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })


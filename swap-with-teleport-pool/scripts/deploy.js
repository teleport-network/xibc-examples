
const hre = require("hardhat")
const { deploy } = require("./utils")
require('dotenv').config()
// let utils = require("../tasks/utils")
require('./utils')

async function main() {



    // deploy CrossChainSwap
    let ccSwap = deploy('CrossChainSwap')
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })


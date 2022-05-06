/*
 * @Descripttion: 
 * @version: 
 * @Author: zsl
 * @Date: 2022-04-29 16:27:49
 */
async function getLogs(tx, eventName, name) {
    let receipt = await tx.wait()
    // todo check
    let evt = receipt.events?.filter((x) => {
        return x.event == eventName
    })
    // console.log(evt)
    return evt[0].args[name]
}

module.exports = {
    getLogs
}
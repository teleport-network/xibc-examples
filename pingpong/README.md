# Abstract

What: This is a cross-chain Dapp called Pingpong that checks whether the source and destination chains can communicate.
Promise: We make sure that our ping-pong gets upgraded as the chain gets upgraded to make you can always use it to check that the source and destination chains are interconnected.
How: If an ACK packet can be heard within a particular time after the cross-chain packet is sent, it indicates that the cross-chain between the source and target chain is healthy. Otherwise, contact the Teleport team.

# 1. Setup Environment
Change .env.example to .env and fill in your variable. 
```shell
# install dependency
yarn 
```
# 2. Compile your contracts
```shell
yarn hardhat compile
```
# 3. Start event listening
```shell
yarn hardhat run scripts/listen.js --network bsc
```

# 4. Send your Ping
After you send a ping, you will get an event named PacketSent (in the listening window launched earlier) indicating that the packet was successfully sent, usually within a few seconds (depending on network conditions). Some core packet-related fields will be printed in the interface.
```shell
yarn hardhat callRemotePing --network bsc                     
```

# 5. Last step. Get ACK.
After receiving the ping packet, you need to wait for the cross-chain package to back (in the event listening window), commonly taking several minutes. If AckPacket appears in the event listening window, the cross-chain channel is healthy.


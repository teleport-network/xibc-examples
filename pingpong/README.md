

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
yarn hardhat run scripts/listen.js --network arbitrum
```

# 4. Send your Ping
After you send a ping, you will get an event named PacketSent (in the listening window launched earlier) indicating that the packet was successfully sent, usually within a few seconds (depending on network conditions). Some core packet-related fields   will be printed in the interface. They are sourceChain, destChain, and sequence, and you can query the packet status on the chain that the packet is through.
```shell
yarn hardhat callRemotePing --network arbitrum   

# evnet listener output
===============enter PacketSent ==================
sequence BigNumber { _hex: '0x03', _isBigNumber: true }
sequence 3
sourceChain arbitrum
destChain rinkeby
relayChain teleport
ports [ 'CONTRACT' ]
===============end PacketSent ==================
```



# How to get packet status

## teleport

If your packet is going through or to teleport, you can check whether the packet has been received.

```shell
# 
# This example is to query on Teleport whether a packet was through arbitrum->teleport->rinkeby has been successfully received on Teleport.
# received: True indicates that the reception was successful.
teleport q xibc packet packet-receipt  arbitrum  rinkeby  3 --node https://rpc.testnet.teleport.network:443


# command output
Ct0ICtoICiVyZWNlaXB0cy9hcmJpdHJ1bS9yaW5rZWJ5L3NlcXVlbmNlcy8zEgEBGg4IARgBIAEqBgACsu6JASIsCAESKAIEsu6JASDXyZznXetBAhoZPEdIxcmO6hM89TokiPp5k12IPVTOpyAiLggBEgcEBrLuiQEgGiEg+PQUlYHGoUuNk4A1lx6t19cA8NCtH+y4yRs5o185/FoiLAgBEigGCrLuiQEgllYA7QWX7P0oOntMSIDMaCMR/7CdfShKAx5mnceW/gIgIi4IARIHCBKy7okBIBohINKNkChW/QvtbER+CIX8Y5oC7u4M02WflWD2bKPE2qMAIi4IARIHCiKy7okBIBohIAwIcBxSYn03Wgpr/i6OaYFKO7UBy/Mu/P8UHP4XFErcIi4IARIHDEqy7okBIBohIA9BUedSsY+51Q/gSUn5nnp1lhKz1x/SegFNHFY97ng5Ii0IARIpDowBsu6JASCPPbnd+uHq5RS3JI4bktCPXJ76Fzp4QMAC5xyxQWhsLiAiLQgBEikQzgGy7okBILSbG3Si/Pdq6+RSk3riPIRAdMOwfqKWcANmifru6CLWICIvCAESCBKeBLLuiQEgGiEgHiPCetBUkhf9Cqyp4IT/eP87bhBgKYeHMHtRvr02bSwiLQgBEikU8gay7okBIGtIMxpjvQuKczJ8z4N0u6SOxhWSKw5OZ0bWqHxQrMrnICItCAESKRb+C7LuiQEgzZ493ZC9JflDxNH2beo8WxjoqBPkcdtrz+QdCt+o0vAgIi8IARIIGIAVsu6JASAaISA7QPpZg/Azc0AicNsGziXJEuADLjDo7H0yQFEKdQ9PeyIvCAESCBqgIbLuiQEgGiEgwYscNMwlNonN2Vskx9yZucuGRSlRqFNTPD4LRmj2GQIiLwgBEggcuj6y7okBIBohILIL3X9aLbwzEjNW//ZMtO43LOmQpCat8/dDGA3GLA8LIi8IARIIHqRysu6JASAaISBkP1Yt22zY5U9iYQcZ7RqDcX0t5eQPno+6cfJyRaZJIyIwCAESCSDGhQKy7okBIBohIBTaAMWL2PA0ui48UcMMoluNN3kJZ9/zexiNcMCo48+uIi4IARIqIoibA5rviQEgw+nzC1fXxb1xfnXnKce0LLEWFtu+3M9rCMBqJQsm0KwgIi4IARIqJMqVBZrviQEgv3efAqoS6Sgu2aP5mtPO1EIISlaDprnW11+nq9b5wlYgIi4IARIqKLbDC8DviQEg1OnlJ9QNvsFBebiu7E/wD/Fna0SfqT/VgapYsAiEsHogIi4IARIqKvDGEcTviQEg7Id7511AdOOaSA8YK9opaPTklsrb6pc33bK0bQDXJS4gIi4IARIqLJTCJsjviQEgER556OLozgXzesHZ6Fr0/Ts/KqRVGyJrEJGCXtCbD5cgIi8IARIrLpbH1QHi74kBIGJNNwxLkc0wxV7gWmHBl3hIirnXbAu/tZXzj2/voaP9IAqEAQqBAQoEeGliYxIgQ1g3wJ50JPYkaRQuqqPnCt3WEsHxdxQxCzQDt/aW6pEaCQgBGAEgASoBACIlCAESIQEI3sjkqoMi0uOJWqcxY2KmExzRF8QNCcFKMoEP9/ssXCIlCAESIQGDGjfU6j2OaCV+1GycN9l+h0/6cqrmOgt/GU67xGstSw==
proof_height:
  revision_height: "1129459"
  revision_number: "0"
received: true

```

## EVM Platform（rinkeby、bsc...

If it is EVM platform, you need to use the following command to check whether packet has reached or passed through a chain.

```shell
# This example is to query whether a packet through Arbitrum ->teleport-> Rinkeby has been successfully executed on Rinkeby. True indicates that execution has been successfully received.
yarn hardhat queryRecipt --packet 0x33ba094497b9a13e5cf224ccce71e9bdcdeb220b  --sourcechain arbitrum  --destchain  rinkeby --sequence  3  --network rinkeby
yarn run v1.22.18
# command output
true
✨  Done in 3.01s.
```

## Whether ping method is called successful.

Usually we inform the off-chain of the execution of our contract by recording the status in the contract and then external queries, or by triggering events.

For simplicity, we record the status in the contract and query the execution status of the contract through hardhat queries.

Before cross-chain execution, we found that received[2] was false. After cross-chain execution, we found that received[2] became true, so our cross-chain ping was correctly executed.

```shell
yarn hardhat getReceived --index  2 --network rinkeby
# command output 
network name rinkeby
cts {
  pingpong: '0x59e346bC6887A080E0A3CE37b0D32664e4e36bd1',
  rcc: '0x8280f4aeda688ce9394736df4cb33b01a9ada0f4',
  packet: '0x33ba094497b9a13e5cf224ccce71e9bdcdeb220b'
}
received: true
✨  Done in 2.90s.
```




# NFT Cross-chain demo

# Asset flow

NFT is composed  of id and uri.

* id is the on-chain ownership.

* uri is the off-chain representation.

![](./imgs/asset_flow.png)

# StateMachine 
![](./imgs/state_machine.png)

# Using  the example
## Setup Enviroment
```shell
# 1. create .env based on the template and modify the configuration in .env
cp .env.example .env
# 2.install dependence
yarn 
```

## Cross Chain

```bash
# send nft cross-chain
# This command makes the NFT with ID 4 cross from the Teleport chain to the Rinkeby chain, using the TELE as the tx fee token, and tx fee is 0.05*10^18, and the receiver is $evm_0
yarn hardhat crosschain  --id 4 --destchain rinkeby --relaychain "" --feeaddr 0x --feeamount 0.05 --receiver $evm_0  --network   teleport
```
## Check Cross-chain status
```shell
yarn hardhat owner --id <your id> --network <network name>
```


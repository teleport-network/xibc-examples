// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "xibc-contracts/evm/contracts/interfaces/IRCC.sol";
import "xibc-contracts/evm/contracts/libraries/app/RCC.sol";
import "xibc-contracts/evm/contracts/libraries/packet/Packet.sol";
import "xibc-contracts/evm/contracts/libraries/utils/Bytes.sol";
import "xibc-contracts/evm/contracts/core/packet/Packet.sol";

contract PingPongRC {
    using Bytes for address;
    // RemoteContractCall Contract Address
    // find it in https://github.com/teleport-network/contracts/
    address public rccAddr;
    // ping sequence indicator, you can connect source chain and
    // target chain cross this index
    uint256 public index;
    // record the ping sequence called by src chain;
    mapping(uint256 => bool) public received;

    /**
     * @dev event will emit when targetChain ping called
     * @param index from src chain
     */
    event Success(uint256 index);

    /**
     * @notice emit when callRemotePing called
     * @param index is ping index
     */
    event RccPing(uint256 index);

    constructor(address _rccAddr) public {
        rccAddr = _rccAddr;
    }

    /**
     * @notice Called by callRemotePing across the chain
     * @param pingIndex is index of src chain
     */
    function ping(uint256 pingIndex) external returns (uint256) {
        received[pingIndex] = true;
        emit Success(pingIndex);
        return pingIndex;
    }

    /**
     * @notice It is called to determine whether the chain is interconnected
     * @param addr target chain's target contract
     * @param destChain target chain
     * @param relayChain relay chain can be empty
     * @param feeAddr  can be ERC20 address or empty(native tokens like ether and BNB, etc)
     * @param feeAmount amount of token you want to give to the relayer
     */
    function callRemotePing(
        address addr,
        string calldata destChain,
        string calldata relayChain,
        address feeAddr,
        uint256 feeAmount
    ) external payable {
        bytes memory reqBytes = abi.encodeWithSelector(
            this.ping.selector,
            index
        );

        IRCC rcc = IRCC(rccAddr);

        RCCDataTypes.RCCData memory rccData = RCCDataTypes.RCCData(
            addr.addressToString(),
            reqBytes,
            destChain,
            relayChain
        );
        PacketTypes.Fee memory fee = PacketTypes.Fee(feeAddr, feeAmount);

        rcc.sendRemoteContractCall{value: msg.value}(rccData, fee);

        emit RccPing(index);
        index++;
    }
}

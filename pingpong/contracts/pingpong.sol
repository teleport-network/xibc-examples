// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./interfaces/IPingPong.sol";
import "xibc-contracts/evm/contracts/interfaces/IRCC.sol";
import "xibc-contracts/evm/contracts/libraries/app/RCC.sol";
import "xibc-contracts/evm/contracts/libraries/packet/Packet.sol";
import "xibc-contracts/evm/contracts/libraries/utils/Bytes.sol";
import "xibc-contracts/evm/contracts/core/packet/Packet.sol";

contract PingPongRC {
    address rccAddr;
    using Bytes for address;

    constructor(address _rccAddr) public {
        rccAddr = _rccAddr;
    }

    /// @notice Called by callRemotePing across the chain
    function ping() external pure returns (bool) {
        return true;
    }

    /// @notice It is called to determine whether the chain is interconnected
    function callRemotePing(
        address addr,
        string calldata destChain,
        string calldata relayChain,
        address feeAddr,
        uint256 feeAmount
    ) external payable {
        bytes memory reqBytes = abi.encodeWithSelector(IPingPong.ping.selector);
        IRCC rcc = IRCC(rccAddr);

        RCCDataTypes.RCCData memory rccData = RCCDataTypes.RCCData(
            addr.addressToString(),
            reqBytes,
            destChain,
            relayChain
        );
        PacketTypes.Fee memory fee = PacketTypes.Fee(feeAddr, feeAmount);

        rcc.sendRemoteContractCall{value: msg.value}(rccData, fee);
    }
}

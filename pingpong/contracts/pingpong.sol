// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./interfaces/IRCC.sol";
import "./interfaces/IPingPong.sol";
import "contracts/libraries/app/RCC.sol";
import "contracts/libraries/packet/Packet.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract PingPongRC {
    using Address for address;

    address rccAddr;

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
            string(abi.encodePacked(addr)),
            reqBytes,
            destChain,
            relayChain
        );
        PacketTypes.Fee memory fee = PacketTypes.Fee(feeAddr, feeAmount);

        rcc.sendRemoteContractCall{value: msg.value}(rccData, fee);
    }
}

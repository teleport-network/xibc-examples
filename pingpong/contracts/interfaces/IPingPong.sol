// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "../proto/Types.sol";
import "../libraries/packet/Packet.sol";

interface IPingPong {

    /**
    * @notice call remote ping
     */
    function ping() external;
}

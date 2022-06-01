// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;
import "xibc-contracts/evm/contracts/libraries/app/MultiCall.sol";
import "xibc-contracts/evm/contracts/interfaces/IMultiCall.sol";
import "xibc-contracts/evm/contracts/libraries/packet/Packet.sol";
import "xibc-contracts/evm/contracts/interfaces/IRCC.sol";
import "xibc-contracts/evm/contracts/libraries/utils/Bytes.sol";
import "xibc-contracts/evm/contracts/libraries/app/RCC.sol";

contract CrossChainSwap {
    using Bytes for bytes;

    IMultiCall muticallIns =
        IMultiCall(0x11cA96C4b71a3B26ABA55b6AD632c3CC4cF03aa8);
    address immutable target;
    address constant USDT = address(0);

    constructor(address _target) public {
        target = _target;
    }

    function remoteSwap() external // address refundAddressOnTeleport,
    // string calldata destChain,
    // MultiCallDataTypes.TransferData calldata erc20transfer
    // TransferDataTypes.TransferData calldata rccTransfer,
    {
        PacketTypes.Fee memory fee = PacketTypes.Fee(USDT, 10e18);
        muticallIns.multiCall(getMulticallData(), fee);
    }

    function getMulticallData()
        internal
        view
        returns (MultiCallDataTypes.MultiCallData memory)
    {
        string memory targetStr = Bytes.addressToString(target); // saving gas
        uint8[] memory functions = new uint8[](2);
        functions[0] = 0;
        functions[1] = 1;

        bytes[] memory dataList = new bytes[](2);
        dataList[0] = abi.encode(
            MultiCallDataTypes.TransferData({
                tokenAddress: USDT,
                receiver: targetStr,
                amount: 20e18
            })
        );

        bytes memory rccBytes = abi.encodeWithSignature("send()");
        dataList[1] = abi.encode(
            MultiCallDataTypes.RCCData(targetStr, rccBytes)
        );

        return
            MultiCallDataTypes.MultiCallData({
                destChain: "teleport",
                relayChain: "",
                functions: functions,
                data: dataList
            });
    }
}

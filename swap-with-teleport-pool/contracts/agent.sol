// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;
// import "xibc-contracts/evm/contracts/apps/target/Proxy.sol";
import "xibc-contracts/evm/contracts/libraries/app/MultiCall.sol";
import "xibc-contracts/evm/contracts/interfaces/IMultiCall.sol";
import "xibc-contracts/evm/contracts/libraries/app/RCC.sol";
import "xibc-contracts/evm/contracts/libraries/utils/Bytes.sol";
import "xibc-contracts/evm/contracts/interfaces/IRCC.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// receive token & construct a muticall to swap token on uniswap on target chain
contract Agent {
    using Bytes for bytes;

    address constant USDT = 0x80aae951aC9BC48f42B950Fe33385E8900149912;
    address remoteCaller;
    address swapReceiver = 0x2a004892ceD093b7176e5355F2650eB09beea6C1;
    address constant MULTICALL = 0x0000000000000000000000000000000030000003;
    IMultiCall multicallIns = IMultiCall(MULTICALL);
    IRCC rcc = IRCC(0x0000000000000000000000000000000030000002);
    address immutable TARGET;

    constructor(address target) public {
        TARGET = target;
    }

    function initAddress(address _remoteCaller) external {
        remoteCaller = _remoteCaller;
    }

    //
    function send()
        external
    // MultiCallDataTypes.MultiCallData calldata muticallData,
    // PacketTypes.Fee calldata fee
    {
        // approve
        IERC20 usdt = IERC20(USDT);
        // fee+transfer
        require(usdt.approve(MULTICALL, 10e18 + 10e18), "approve failed");
        PacketTypes.Fee memory fee = PacketTypes.Fee(USDT, 10e18);
        multicallIns.multiCall(getMulticallData(), fee);
    }

    function getMulticallData()
        internal
        view
        returns (MultiCallDataTypes.MultiCallData memory)
    {
        uint8[] memory functions = new uint8[](2);
        functions[0] = 0;
        functions[1] = 1;

        bytes[] memory dataList = new bytes[](2);
        dataList[0] = abi.encode(
            MultiCallDataTypes.TransferData({
                tokenAddress: USDT,
                receiver: Bytes.addressToString(TARGET),
                amount: 10e18
            })
        );

        bytes memory rccBytes = abi.encodeWithSignature(
            "swapExactInputSingle(uint256,address)",
            10e18,
            swapReceiver
        );
        dataList[1] = abi.encode(
            MultiCallDataTypes.RCCData(Bytes.addressToString(TARGET), rccBytes)
        );

        return
            MultiCallDataTypes.MultiCallData({
                destChain: "rinkeby",
                relayChain: "",
                functions: functions,
                data: dataList
            });
    }
}

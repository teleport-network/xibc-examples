// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;
import "xibc-contracts/evm/contracts/libraries/app/MultiCall.sol";
import "xibc-contracts/evm/contracts/interfaces/IMultiCall.sol";
import "xibc-contracts/evm/contracts/libraries/packet/Packet.sol";
import "xibc-contracts/evm/contracts/interfaces/IRCC.sol";
import "xibc-contracts/evm/contracts/libraries/utils/Bytes.sol";
import "xibc-contracts/evm/contracts/libraries/app/RCC.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract CrossChainSwap {
    using Bytes for bytes;

    IMultiCall muticallIns =
        IMultiCall(0x11cA96C4b71a3B26ABA55b6AD632c3CC4cF03aa8);
    address constant RIN_USDT = 0xB0Dfaaa92e4F3667758F2A864D50F94E8aC7a56B;
    address constant RIN_TEST = 0xB0Dfaaa92e4F3667758F2A864D50F94E8aC7a56B;
    address constant RIN_SWAP_REVEIVER =
        0x7e01879e94241c8A022Cb6708C7F241f86039Ff6;
    address constant RIN_SWAP_ROUTER =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    uint256 constant SWAP_AMOUNT_IN = 10e18;

    address constant TELE_USDT = 0x80aae951aC9BC48f42B950Fe33385E8900149912;

    string constant TELE_MUTICALL =
        "0x0000000000000000000000000000000030000003";
    string constant TELE_RCC = "0x0000000000000000000000000000000030000002";

    constructor(address _target) public {}

    function remoteSwap() external {
        /**
         * construct multicall to rinkeby
         * 1. transfer to rcc contract
         * 2. rcc approve token
         * 3. rcc call swap method of uniswap
         */
        // 1.
        MultiCallDataTypes.TransferData
            memory rinTransferData = MultiCallDataTypes.TransferData({
                tokenAddress: TELE_USDT,
                receiver: "0x8280f4aeda688ce9394736df4cb33b01a9ada0f4",
                amount: 20e18
            });

        // 2.
        MultiCallDataTypes.RCCData[]
            memory teleRccDatas = new MultiCallDataTypes.RCCData[](2);
        teleRccDatas[0] = MultiCallDataTypes.RCCData(
            "0xb0dfaaa92e4f3667758f2a864d50f94e8ac7a56b",
            abi.encodeWithSelector(
                IERC20.approve.selector,
                0xE592427A0AEce92De3Edee1F18E0157C05861564,
                10e18
            )
        );
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: RIN_USDT,
                tokenOut: 0x0bD0921cc3F7441D5ca01758dbc4d927b6a558f1,
                fee: 5000,
                recipient: RIN_SWAP_REVEIVER,
                deadline: block.timestamp,
                amountIn: SWAP_AMOUNT_IN,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        teleRccDatas[1] = MultiCallDataTypes.RCCData(
            Bytes.addressToString(RIN_SWAP_ROUTER),
            abi.encodeWithSelector(
                ISwapRouter.exactInputSingle.selector,
                params
            )
        );
        MultiCallDataTypes.MultiCallData
            memory teleMulticallData = getMulticallData(
                rinTransferData,
                teleRccDatas,
                "rinkeby"
            );

        /**
         * construct multicall
         * 1. transfer to rcc contract
         * 2. rcc call multicall
         */
        PacketTypes.Fee memory fee = PacketTypes.Fee(TELE_USDT, 10e18);
        // 2. rcc call multicall
        bytes memory rccBytes = abi.encodeWithSelector(
            IMultiCall.multiCall.selector,
            teleMulticallData,
            fee
        );
        MultiCallDataTypes.RCCData[]
            memory rccDatas = new MultiCallDataTypes.RCCData[](1);
        rccDatas[0] = MultiCallDataTypes.RCCData(TELE_MUTICALL, rccBytes);
        MultiCallDataTypes.MultiCallData memory multicallData = getMulticallData(
            MultiCallDataTypes.TransferData({ //1. transfer to rcc contract
                tokenAddress: TELE_USDT,
                receiver: TELE_RCC,
                amount: 20e18
            }),
            rccDatas,
            "teleport"
        );

        muticallIns.multiCall(multicallData, fee);
    }

    //
    function getMulticallData(
        MultiCallDataTypes.TransferData memory transData,
        MultiCallDataTypes.RCCData[] memory rccDatas,
        string memory _destChain
    ) internal pure returns (MultiCallDataTypes.MultiCallData memory) {
        uint256 rccNum = rccDatas.length;
        uint8[] memory functions = new uint8[](rccNum + 1);
        bytes[] memory dataList = new bytes[](rccNum + 1);
        for (uint i = 0; i <= rccNum; i++) {
            if (i == 0) {
                functions[i] = 0;
                dataList[i] = abi.encode(transData);
            } else {
                functions[i] = 1;
                dataList[i] = abi.encode(rccDatas[i]);
            }
        }

        return
            MultiCallDataTypes.MultiCallData({
                destChain: _destChain,
                relayChain: "",
                functions: functions,
                data: dataList
            });
    }
}

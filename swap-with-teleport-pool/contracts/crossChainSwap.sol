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
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "hardhat/console.sol";

import "xibc-contracts/evm/contracts/core/packet/Packet.sol";

contract CrossChainSwap {
    using Bytes for bytes;

    IMultiCall muticallIns =
        IMultiCall(0x11cA96C4b71a3B26ABA55b6AD632c3CC4cF03aa8);
    address constant RIN_USDT = 0xB0Dfaaa92e4F3667758F2A864D50F94E8aC7a56B;
    address constant RIN_TEST = 0x0bD0921cc3F7441D5ca01758dbc4d927b6a558f1;
    address constant RIN_SWAP_REVEIVER =
        0x7e01879e94241c8A022Cb6708C7F241f86039Ff6;
    address constant RIN_SWAP_ROUTER =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address constant TELE_USDT = 0x80aae951aC9BC48f42B950Fe33385E8900149912;
    string constant TELE_MUTICALL =
        "0x0000000000000000000000000000000030000003";
    address constant TELE_MUTICALL_ADDR =
        0x0000000000000000000000000000000030000003;
    string constant TELE_RCC = "0x0000000000000000000000000000000030000002";
    string constant RIN_RCC = "0x8280f4aeda688ce9394736df4cb33b01a9ada0f4";

    address constant ARB_USDT = 0x2436DE6B227eEfc84245260f74f096136b217093;
    uint256 constant SWAP_AMOUNT = 10e18;
    uint256 constant FEE_AMOUNT = 1e18;
    uint256 constant POOL_FEE = 500;

    constructor() public {}

    // we need to construct two multicall packets , one is  source chain to teleport, and another one is teleport to destchain.
    function remoteSwap() external {
        /**
         * construct multicall packet from teleport to rinkeby
         * 1. transfer to rcc contract
         * 2. rcc approve token
         * 3. rcc call swap method of uniswap
         */
        // 1.
        MultiCallDataTypes.TransferData
            memory rinTransferData = MultiCallDataTypes.TransferData({
                tokenAddress: TELE_USDT,
                receiver: RIN_RCC,
                amount: SWAP_AMOUNT + POOL_FEE
            });

        // 2.
        MultiCallDataTypes.RCCData[]
            memory targetChainRccDatas = new MultiCallDataTypes.RCCData[](2);
        targetChainRccDatas[0] = MultiCallDataTypes.RCCData(
            Bytes.addressToString(RIN_USDT),
            abi.encodeWithSelector(
                IERC20.approve.selector,
                RIN_SWAP_ROUTER,
                SWAP_AMOUNT + POOL_FEE
            )
        );
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: RIN_USDT,
                tokenOut: RIN_TEST,
                fee: 500,
                recipient: RIN_SWAP_REVEIVER,
                deadline: type(uint256).max,
                amountIn: SWAP_AMOUNT,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        targetChainRccDatas[1] = MultiCallDataTypes.RCCData(
            Bytes.addressToString(RIN_SWAP_ROUTER),
            abi.encodeWithSelector(
                ISwapRouter.exactInputSingle.selector,
                params
            )
        );
        MultiCallDataTypes.MultiCallData
            memory targetChainMulticallData = getMulticallData(
                rinTransferData,
                targetChainRccDatas,
                "rinkeby"
            );

        /**
         * construct multicall to teleport
         * 1. transfer to rcc contract
         * 2. approve usdt to muticall
         * 2. rcc call multicall
         */
        PacketTypes.Fee memory feeTele = PacketTypes.Fee(TELE_USDT, FEE_AMOUNT);
        // 2. rcc call multicall
        bytes memory rccBytes = abi.encodeWithSelector(
            IMultiCall.multiCall.selector,
            targetChainMulticallData,
            feeTele
        );
        MultiCallDataTypes.RCCData[]
            memory rccDatas = new MultiCallDataTypes.RCCData[](2);
        rccDatas[0] = MultiCallDataTypes.RCCData(
            Bytes.addressToString(TELE_USDT),
            abi.encodeWithSelector(
                IERC20.approve.selector,
                TELE_MUTICALL_ADDR,
                SWAP_AMOUNT + POOL_FEE + FEE_AMOUNT
            )
        );
        rccDatas[1] = MultiCallDataTypes.RCCData(TELE_MUTICALL, rccBytes);
        MultiCallDataTypes.MultiCallData memory multicallData = getMulticallData(
            MultiCallDataTypes.TransferData({ //1. transfer to rcc contract
                tokenAddress: ARB_USDT,
                receiver: TELE_RCC,
                amount: SWAP_AMOUNT + POOL_FEE + FEE_AMOUNT
            }),
            rccDatas,
            "teleport"
        );
        PacketTypes.Fee memory fee = PacketTypes.Fee(ARB_USDT, FEE_AMOUNT);

        IERC20(ARB_USDT).approve(
            address(muticallIns),
            SWAP_AMOUNT + 2 * FEE_AMOUNT + POOL_FEE
        );
        muticallIns.multiCall(multicallData, fee);
    }

    function callMulticallToSwap() external {
        MultiCallDataTypes.TransferData
            memory rinTransferData = MultiCallDataTypes.TransferData({
                tokenAddress: TELE_USDT,
                receiver: RIN_RCC,
                amount: SWAP_AMOUNT + POOL_FEE
            });

        // 2.
        MultiCallDataTypes.RCCData[]
            memory targetChainRccDatas = new MultiCallDataTypes.RCCData[](2);
        targetChainRccDatas[0] = MultiCallDataTypes.RCCData(
            Bytes.addressToString(RIN_USDT),
            abi.encodeWithSelector(
                IERC20.approve.selector,
                RIN_SWAP_ROUTER,
                SWAP_AMOUNT + POOL_FEE
            )
        );
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: RIN_USDT,
                tokenOut: RIN_TEST,
                fee: 500,
                recipient: RIN_SWAP_REVEIVER,
                deadline: type(uint256).max,
                amountIn: SWAP_AMOUNT,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
        // The call to `exactInputSingle` executes the swap.
        targetChainRccDatas[1] = MultiCallDataTypes.RCCData(
            Bytes.addressToString(RIN_SWAP_ROUTER),
            abi.encodeWithSelector(
                ISwapRouter.exactInputSingle.selector,
                params
            )
        );
        MultiCallDataTypes.MultiCallData
            memory targetChainMulticallData = getMulticallData(
                rinTransferData,
                targetChainRccDatas,
                "rinkeby"
            );
        PacketTypes.Fee memory feeTele = PacketTypes.Fee(TELE_USDT, FEE_AMOUNT);
        IERC20(TELE_USDT).approve(
            0x0000000000000000000000000000000030000003,
            SWAP_AMOUNT + FEE_AMOUNT + POOL_FEE
        );
        IMultiCall teleMulticallIns = IMultiCall(
            0x0000000000000000000000000000000030000003
        );
        teleMulticallIns.multiCall(targetChainMulticallData, feeTele);
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
                dataList[i] = abi.encode(rccDatas[i - 1]);
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

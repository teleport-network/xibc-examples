// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// @Deprecated
contract SwapAgent is Ownable {
    // For the scope of these swap examples,
    // we will detail the design considerations when using
    // `exactInput`, `exactInputSingle`, `exactOutput`, and  `exactOutputSingle`.

    // It should be noted that for the sake of these examples, we purposefully pass in the swap router instead of inherit the swap router for simplicity.
    // More advanced example contracts will detail how to inherit the swap router safely.

    ISwapRouter public immutable swapRouter;

    // This example swaps DAI/WETH9 for single path swaps and DAI/USDC/WETH9 for multi path swaps.

    // token want to swap
    address public constant USDT = 0xB0Dfaaa92e4F3667758F2A864D50F94E8aC7a56B;
    address public constant TEST = 0x0bD0921cc3F7441D5ca01758dbc4d927b6a558f1;
    address public constant RCC = 0x8280F4aedA688Ce9394736DF4Cb33B01a9aDa0f4;

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;

    modifier onlyRCC() {
        require(msg.sender == RCC, "only RCC allowed");
        _;
    }

    constructor(ISwapRouter _swapRouter) public {
        swapRouter = _swapRouter;
    }

    /// @notice swapExactInputSingle swaps a fixed amount of USDT for a maximum possible amount of TEST
    /// using the USDT/TEST 0.05% pool by calling `exactInputSingle` in the swap router.
    /// @param amountIn The exact amount of USDT that will be swapped for TEST.
    /// @return amountOut The amount of TEST received.
    function swapExactInputSingle(uint256 amountIn, address receiver)
        external
        onlyRCC
        returns (uint256 amountOut)
    {
        // msg.sender must approve this contract

        // Transfer the specified amount of DAI to this contract.
        // TransferHelper.safeTransferFrom(DAI, msg.sender, address(this), amountIn);

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(USDT, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: USDT,
                tokenOut: TEST,
                fee: poolFee,
                recipient: receiver,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    /// We just use it to test swap method.
    function swapExactInputSingleV2(uint256 amountIn, address receiver)
        external
        returns (uint256 amountOut)
    {
        // msg.sender must approve this contract

        // Transfer the specified amount of USDT to this contract.
        // TransferHelper.safeTransferFrom(USDT, msg.sender, address(this), amountIn);

        // Approve the router to spend USDT.
        // TransferHelper
        TransferHelper.safeApprove(USDT, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: USDT,
                tokenOut: TEST,
                fee: poolFee,
                recipient: receiver,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }
}

// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';

/// @title Liquidity Book Flashloan Callback Interface
/// @author Trader Joe
/// @notice Required interface to interact with LB flash loans
interface ILBFlashLoanCallback {
    function LBFlashLoanCallback(
        address sender,
        IERC20 tokenX,
        IERC20 tokenY,
        bytes32 amounts,
        bytes32 totalFees,
        bytes calldata data
    ) external returns (bytes32);
}

interface ILBPair {
    function flashLoan(ILBFlashLoanCallback receiver, bytes32 amounts, bytes calldata data) external;
}

contract MockLBFlashLoanCallback is ILBFlashLoanCallback {
    using SafeERC20 for IERC20;

    uint private constant OFFSET = 128;
    uint private constant MASK_128 = 0xffffffffffffffffffffffffffffffff;
    bytes32 internal constant CALLBACK_SUCCESS = keccak256('LBPair.onFlashLoan');

    address public lbToken;

    constructor(address _lbToken) {
        lbToken = _lbToken;
    }

    function LBFlashLoanCallback(
        address, // sender address not use
        IERC20 tokenX,
        IERC20 tokenY,
        bytes32 amounts,
        bytes32, // totalFees not use
        bytes calldata data
    ) external returns (bytes32 returnData) {
        // borrow amounts
        (uint128 amountX, uint128 amountY) = decode(amounts);
        // payback
        IERC20(tokenX).transfer(lbToken, amountX);
        IERC20(tokenY).transfer(lbToken, amountY);
        {
            // donation (including fee)
            (address donator, uint128 donateAmountX, uint128 donateAmountY) =
                abi.decode(data, (address, uint128, uint128));
            IERC20(tokenX).safeTransferFrom(donator, lbToken, donateAmountX);
            IERC20(tokenY).safeTransferFrom(donator, lbToken, donateAmountY);
        }

        // mark as success, otherwise the pair will throw an error
        returnData = CALLBACK_SUCCESS;
    }

    function loanWithDonation(
        uint128 _amountX,
        uint128 _amountY,
        address _donator,
        uint _donateAmountX,
        uint _donateAmountY
    ) external {
        bytes32 amounts = encode(_amountX, _amountY);
        bytes memory data = abi.encode(_donator, _donateAmountX, _donateAmountY);

        // flashLoan
        ILBPair(lbToken).flashLoan(ILBFlashLoanCallback(this), amounts, data);
    }

    // encode two 128.128 numbers to bytes32
    function encode(uint128 x1, uint128 x2) internal pure returns (bytes32 z) {
        assembly {
            z := or(and(x1, MASK_128), shl(OFFSET, x2))
        }
    }

    // decode bytes32 to two 128.128 numbers
    function decode(bytes32 z) internal pure returns (uint128 x1, uint128 x2) {
        assembly {
            x1 := and(z, MASK_128)
            x2 := shr(OFFSET, z)
        }
    }
}

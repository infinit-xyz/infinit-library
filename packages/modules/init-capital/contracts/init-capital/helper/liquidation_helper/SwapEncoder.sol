// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../../interfaces/helper/liquidation_helper/ISwapDataEncoder.sol';

library BytesLib {
    function slice(bytes memory _bytes, uint _start, uint _length) internal pure returns (bytes memory) {
        require(_length + 31 >= _length, 'slice_overflow');
        require(_start + _length >= _start, 'slice_overflow');
        require(_bytes.length >= _start + _length, 'slice_outOfBounds');

        bytes memory tempBytes;

        assembly {
            switch iszero(_length)
            case 0 {
                // Get a location of some free memory and store it in tempBytes as
                // Solidity does for memory variables.
                tempBytes := mload(0x40)

                // The first word of the slice result is potentially a partial
                // word read from the original array. To read it, we calculate
                // the length of that partial word and start copying that many
                // bytes into the array. The first word we copy will start with
                // data we don't care about, but the last `lengthmod` bytes will
                // land at the beginning of the contents of the new array. When
                // we're done copying, we overwrite the full first word with
                // the actual length of the slice.
                let lengthmod := and(_length, 31)

                // The multiplication in the next line is necessary
                // because when slicing multiples of 32 bytes (lengthmod == 0)
                // the following copy loop was copying the origin's length
                // and then ending prematurely not copying everything it should.
                let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
                let end := add(mc, _length)

                for {
                    // The multiplication in the next line has the same exact purpose
                    // as the one above.
                    let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
                } lt(mc, end) {
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } { mstore(mc, mload(cc)) }

                mstore(tempBytes, _length)

                //update free-memory pointer
                //allocating the array padded to 32 bytes like the compiler does now
                mstore(0x40, and(add(mc, 31), not(31)))
            }
            //if we want a zero-length slice let's just return a zero-length array
            default {
                tempBytes := mload(0x40)
                //zero out the 32 bytes slice we are about to return
                //we need to do it because Solidity does not garbage collect
                mstore(tempBytes, 0)

                mstore(0x40, add(tempBytes, 0x20))
            }
        }

        return tempBytes;
    }
}

contract SwapEncoder is ISwapEncoder {
    using BytesLib for bytes;

    // The length of the bytes encoded address
    uint private constant ADDR_SIZE = 20;
    // The length of the bytes encoded fee
    uint private constant FEE_SIZE = 3;
    // The offset of a single token address and pool fee
    uint private constant NEXT_OFFSET = ADDR_SIZE + FEE_SIZE;

    // NOTE: use uint instead of enum to avoid code upgrade
    // 1: uniswap v2
    // 2: uniswap v3
    // 3: curve
    // 4: joe v2.1
    // 5: balancer
    function getCalldata(
        address _swapper,
        bytes calldata _swapInfo,
        SwapOperation _operation,
        uint _routerType,
        uint _amount
    ) external view returns (bytes memory) {
        if (_operation == SwapOperation.EXACT_IN) {
            if (_routerType == 1) {
                UniswapV2SwapInfo memory _decodedSwapInfo = abi.decode(_swapInfo, (UniswapV2SwapInfo));
                return abi.encodeWithSelector(
                    ISwapRouter.swapExactTokensForTokens.selector,
                    _amount,
                    0,
                    _decodedSwapInfo.path,
                    _swapper,
                    block.timestamp
                );
            } else if (_routerType == 2) {
                UniswapV3SwapInfo memory _decodedSwapInfo = abi.decode(_swapInfo, (UniswapV3SwapInfo));
                return abi.encodeWithSelector(
                    ISwapRouter.exactInput.selector,
                    ExactInputParams({
                        path: _decodedSwapInfo.path,
                        recipient: _swapper,
                        deadline: block.timestamp,
                        amountIn: _amount,
                        amountOutMinimum: 0
                    })
                );
            }
        } else if (_operation == SwapOperation.EXACT_OUT) {
            if (_routerType == 1) {
                UniswapV2SwapInfo memory _decodedSwapInfo = abi.decode(_swapInfo, (UniswapV2SwapInfo));
                return abi.encodeWithSelector(
                    ISwapRouter.swapTokensForExactTokens.selector,
                    _amount,
                    type(uint).max,
                    _decodedSwapInfo.path,
                    _swapper,
                    block.timestamp
                );
            } else if (_routerType == 2) {
                UniswapV3SwapInfo memory _decodedSwapInfo = abi.decode(_swapInfo, (UniswapV3SwapInfo));
                return abi.encodeWithSelector(
                    ISwapRouter.exactOutput.selector,
                    ExactOutputParams({
                        path: _reversePath(_decodedSwapInfo.path),
                        recipient: _swapper,
                        deadline: block.timestamp,
                        amountOut: _amount,
                        amountInMaximum: type(uint).max
                    })
                );
            }
        }
    }

    function _reversePath(bytes memory path) internal pure returns (bytes memory reversePath) {
        uint curIdx; // current index in path

        while (curIdx + NEXT_OFFSET < path.length) {
            reversePath = bytes.concat(path.slice(curIdx, ADDR_SIZE), reversePath);
            reversePath = bytes.concat(path.slice(curIdx + ADDR_SIZE, FEE_SIZE), reversePath);
            unchecked {
                curIdx += NEXT_OFFSET;
            }
        }
        reversePath = bytes.concat(path.slice(curIdx, ADDR_SIZE), reversePath);
    }
}

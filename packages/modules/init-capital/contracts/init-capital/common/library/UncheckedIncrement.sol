// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

library UncheckedIncrement {
    function uinc(uint self) internal pure returns (uint) {
        unchecked {
            return self + 1;
        }
    }
}

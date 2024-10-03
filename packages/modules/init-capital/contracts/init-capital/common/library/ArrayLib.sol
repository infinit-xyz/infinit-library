// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import './UncheckedIncrement.sol';

library AddressArrayLib {
    using UncheckedIncrement for uint;

    /// @dev check that the array is sorted and has no duplicate
    /// @param _arr the array to be checked
    function isSortedAndNotDuplicate(address[] calldata _arr) internal pure returns (bool) {
        uint poolLen = _arr.length;
        for (uint i = 1; i < poolLen; i = i.uinc()) {
            if (_arr[i - 1] >= _arr[i]) return false;
        }
        return true;
    }
}

// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

import {IIRM} from '../interfaces/lending_pool/IIRM.sol';

contract MockFixedRateIRM is IIRM {
    uint public immutable FIXED_INTEREST_RATE__e18; // rate per second

    constructor(uint _fixedInterestRate_e18) {
        FIXED_INTEREST_RATE__e18 = _fixedInterestRate_e18;
    }

    /// @inheritdoc IIRM
    function getBorrowRate_e18(uint, uint) external view override returns (uint) {
        return FIXED_INTEREST_RATE__e18;
    }
}

// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IIRM} from '../interfaces/lending_pool/IIRM.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';

contract DoubleSlopeIRM is IIRM {
    // constants
    uint private constant ONE_E18 = 1e18;

    // immutables
    uint public immutable BASE_BORR_RATE_E18; // rate per second
    uint public immutable BORR_RATE_MULTIPLIER_E18; // m1
    uint public immutable JUMP_UTIL_E18; // utilization at which the BORROW_RATE_M2 is applied
    uint public immutable JUMP_MULTIPLIER_E18; // m2

    // constructor
    // NOTE: alway deploy new irm contract when change params to make sure interest will be accrued before changing borrow rate
    constructor(
        uint _baseBorrowRate_e18,
        uint _jumpUtilization_e18,
        uint _borrowRateMultiplier_e18,
        uint _jumpMultiplier_e18
    ) {
        BASE_BORR_RATE_E18 = _baseBorrowRate_e18;
        JUMP_UTIL_E18 = _jumpUtilization_e18;
        BORR_RATE_MULTIPLIER_E18 = _borrowRateMultiplier_e18;
        JUMP_MULTIPLIER_E18 = _jumpMultiplier_e18;
    }

    // functions
    /// @inheritdoc IIRM
    function getBorrowRate_e18(uint _cash, uint _debt) external view override returns (uint borrow_rate_e18) {
        // borrow rate = baseRate + m1 * min(uti, jumpUtil) + m2 * max(0, uti - jumpUtil)
        uint totalAsset = _cash + _debt;
        uint util_e18 = totalAsset == 0 ? 0 : (_debt * ONE_E18) / totalAsset;
        borrow_rate_e18 = BASE_BORR_RATE_E18 + (Math.min(util_e18, JUMP_UTIL_E18) * BORR_RATE_MULTIPLIER_E18) / ONE_E18;
        if (util_e18 > JUMP_UTIL_E18) {
            borrow_rate_e18 += ((util_e18 - JUMP_UTIL_E18) * JUMP_MULTIPLIER_E18) / ONE_E18;
        }
    }
}

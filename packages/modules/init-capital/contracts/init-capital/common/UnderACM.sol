// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IAccessControlManager} from '../interfaces/common/IAccessControlManager.sol';

abstract contract UnderACM {
    // immutables
    IAccessControlManager public immutable ACM; // access control manager

    // constructor
    constructor(address _acm) {
        ACM = IAccessControlManager(_acm);
    }
}

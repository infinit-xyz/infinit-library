// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '@openzeppelin-contracts/access/AccessControlDefaultAdminRules.sol';
import {IAccessControlManager} from '../interfaces/common/IAccessControlManager.sol';

contract AccessControlManager is IAccessControlManager, AccessControlDefaultAdminRules {
    // constructor
    constructor() AccessControlDefaultAdminRules(0, msg.sender) {}

    // functions
    /// @inheritdoc IAccessControlManager
    function checkRole(bytes32 _role, address _user) external view {
        _checkRole(_role, _user);
    }
}

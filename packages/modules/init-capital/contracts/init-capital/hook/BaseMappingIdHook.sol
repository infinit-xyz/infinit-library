// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {ERC721HolderUpgradeable} from '@openzeppelin-contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol';

abstract contract BaseMappingIdHook is ERC721HolderUpgradeable {
    using SafeERC20 for IERC20;

    // immutables
    address public immutable CORE;
    address public immutable POS_MANAGER;
    // storages
    mapping(address => uint) public lastPosIds;
    mapping(address => mapping(uint => uint)) public initPosIds;

    // constructor
    constructor(address _core, address _posManager) {
        CORE = _core;
        POS_MANAGER = _posManager;
    }

    /// @dev approve token for init core if needed
    /// @param _token token address
    /// @param _amt token amount to spend
    function _ensureApprove(address _token, uint _amt) internal {
        if (IERC20(_token).allowance(address(this), CORE) < _amt) {
            IERC20(_token).safeApprove(CORE, type(uint).max);
        }
    }
}

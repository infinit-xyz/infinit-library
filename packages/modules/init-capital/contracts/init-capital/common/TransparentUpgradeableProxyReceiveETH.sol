// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {TransparentUpgradeableProxy} from '@openzeppelin-contracts/proxy/transparent/TransparentUpgradeableProxy.sol';

contract TransparentUpgradeableProxyReceiveETH is TransparentUpgradeableProxy {
    constructor(address _logic, address admin_, bytes memory _data)
        payable
        TransparentUpgradeableProxy(_logic, admin_, _data)
    {}

    receive() external payable override {}
}

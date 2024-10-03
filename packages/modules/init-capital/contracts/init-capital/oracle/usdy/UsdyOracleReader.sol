// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IUsdyOracleReader, IBaseOracle} from '../../interfaces/oracle/usdy/IUsdyOracleReader.sol';
import {IRWADynamicOracle} from '../../interfaces/oracle/usdy/IRWADynamicOracle.sol';

contract UsdyOracleReader is IUsdyOracleReader {
    // constants
    uint private constant ONE_E18 = 1e18;
    // immutables
    /// @inheritdoc IUsdyOracleReader
    address public immutable override RWA_DYNAMIC_ORACLE;

    constructor(address _rwaDynamicOracle) {
        RWA_DYNAMIC_ORACLE = _rwaDynamicOracle;
    }

    /// @inheritdoc IBaseOracle
    function getPrice_e36(address) external view returns (uint) {
        // IRWADynamicOracle returns usd price
        // price * 1e36 / 10 ** (18 + usdy decimals)
        return IRWADynamicOracle(RWA_DYNAMIC_ORACLE).getPrice();
    }
}

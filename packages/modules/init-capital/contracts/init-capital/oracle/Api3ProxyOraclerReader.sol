// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {SafeCast} from '@openzeppelin-contracts/utils/math/SafeCast.sol';
import {IERC20Metadata} from '@openzeppelin-contracts/token/ERC20/extensions/IERC20Metadata.sol';
import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';

import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';
import {UnderACM} from '../common/UnderACM.sol';

import {IApi3ProxyOracleReader, IBaseOracle} from '../interfaces/oracle/api3/IApi3ProxyOracleReader.sol';
import {IApi3Proxy} from '../interfaces/oracle/api3/IApi3Proxy.sol';
contract Api3ProxyOracleReader is IApi3ProxyOracleReader, UnderACM, Initializable {
    using SafeCast for int224;
    using UncheckedIncrement for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GOVERNOR = keccak256('governor');

    // storages
    mapping(address => DataFeedInfo) public dataFeedInfos; // @inheritdoc IApi3ProxyOracleReader

    // modifiers
    modifier onlyGovernor() {
        ACM.checkRole(GOVERNOR, msg.sender);
        _;
    }

    // constructor
    constructor(address _acm) UnderACM(_acm) {
        _disableInitializers();
    }

    // functions
    /// @inheritdoc IApi3ProxyOracleReader
    function setDataFeedProxies(address[] calldata _tokens, address[] calldata _dataFeedProxies) external onlyGovernor {
        _require(_dataFeedProxies.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);

        for (uint i; i < _dataFeedProxies.length; i = i.uinc()) {
            dataFeedInfos[_tokens[i]].dataFeedProxy = _dataFeedProxies[i];
            emit SetDataFeed(_tokens[i], _dataFeedProxies[i]);
        }
    }

    

    /// @inheritdoc IApi3ProxyOracleReader
    function setMaxStaleTimes(address[] calldata _tokens, uint[] calldata _maxStaleTimes) external onlyGovernor {
        _require(_maxStaleTimes.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);

        for (uint i; i < _maxStaleTimes.length; i = i.uinc()) {
            dataFeedInfos[_tokens[i]].maxStaleTime = _maxStaleTimes[i];
            emit SetMaxStaleTime(_tokens[i], _maxStaleTimes[i]);
        }
    }

    /// @inheritdoc IBaseOracle
    function getPrice_e36(address _token) external view returns (uint price_e36) {
        // load and check
        DataFeedInfo memory dataFeedInfo = dataFeedInfos[_token];
        _require(dataFeedInfo.dataFeedProxy != address(0), Errors.DATAFEED_PROXY_NOT_SET);
        _require(dataFeedInfo.maxStaleTime != 0, Errors.MAX_STALETIME_NOT_SET);

        // get price and token's decimals
        uint decimals = uint(IERC20Metadata(_token).decimals());
        // return price per token with 1e18 precisions
        // e.g. 1 BTC = 35000 * 1e18 in USD_e18 unit
        (int224 price, uint timestamp) = IApi3Proxy(dataFeedInfo.dataFeedProxy).read();

        // check if the last updated is not longer than the max stale time
        if (block.timestamp > timestamp) {
            _require(block.timestamp - timestamp <= dataFeedInfo.maxStaleTime, Errors.MAX_STALETIME_EXCEEDED);
        }

        // return as [USD_e36 per wei unit]
        price_e36 = (price.toUint256() * ONE_E18) / 10 ** decimals;
    }
}

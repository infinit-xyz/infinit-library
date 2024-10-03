// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {SafeCast} from '@openzeppelin-contracts/utils/math/SafeCast.sol';
import {IERC20Metadata} from '@openzeppelin-contracts/token/ERC20/extensions/IERC20Metadata.sol';
import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';

import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';
import {UnderACM} from '../common/UnderACM.sol';

import {IApi3OracleReader, IBaseOracle} from '../interfaces/oracle/api3/IApi3OracleReader.sol';
import {IApi3ServerV1} from '../interfaces/oracle/api3/IApi3ServerV1.sol';

contract Api3OracleReader is IApi3OracleReader, UnderACM, Initializable {
    using SafeCast for int224;
    using UncheckedIncrement for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GOVERNOR = keccak256('governor');

    // storages
    address public api3ServerV1; // @inheritdoc IApi3OracleReader
    mapping(address => DataFeedInfo) public dataFeedInfos; // @inheritdoc IApi3OracleReader

    // modifiers
    modifier onlyGovernor() {
        ACM.checkRole(GOVERNOR, msg.sender);
        _;
    }

    // constructor
    constructor(address _acm) UnderACM(_acm) {
        _disableInitializers();
    }

    // initializer
    /// @dev initialize contract and set api3 server v1 address
    /// @param _api3ServerV1 api3 server v1 address
    function initialize(address _api3ServerV1) external initializer {
        api3ServerV1 = _api3ServerV1;
        emit SetApi3ServerV1(_api3ServerV1);
    }

    // functions
    /// @inheritdoc IApi3OracleReader
    function setDataFeedIds(address[] calldata _tokens, bytes32[] calldata _dataFeedIds) external onlyGovernor {
        _require(_dataFeedIds.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);

        for (uint i; i < _dataFeedIds.length; i = i.uinc()) {
            dataFeedInfos[_tokens[i]].dataFeedId = _dataFeedIds[i];
            emit SetDataFeed(_tokens[i], _dataFeedIds[i]);
        }
    }

    /// @inheritdoc IApi3OracleReader
    function setApi3ServerV1(address _api3ServerV1) external onlyGovernor {
        api3ServerV1 = _api3ServerV1;
        emit SetApi3ServerV1(api3ServerV1);
    }

    /// @inheritdoc IApi3OracleReader
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
        _require(dataFeedInfo.dataFeedId != bytes32(0), Errors.DATAFEED_ID_NOT_SET);
        _require(dataFeedInfo.maxStaleTime != 0, Errors.MAX_STALETIME_NOT_SET);

        // get price and token's decimals
        uint decimals = uint(IERC20Metadata(_token).decimals());
        // return price per token with 1e18 precisions
        // e.g. 1 BTC = 35000 * 1e18 in USD_e18 unit
        (int224 price, uint timestamp) = IApi3ServerV1(api3ServerV1).readDataFeedWithId(dataFeedInfo.dataFeedId);

        // check if the last updated is not longer than the max stale time
        if (block.timestamp > timestamp) {
            _require(block.timestamp - timestamp <= dataFeedInfo.maxStaleTime, Errors.MAX_STALETIME_EXCEEDED);
        }

        // return as [USD_e36 per wei unit]
        price_e36 = (price.toUint256() * ONE_E18) / 10 ** decimals;
    }
}
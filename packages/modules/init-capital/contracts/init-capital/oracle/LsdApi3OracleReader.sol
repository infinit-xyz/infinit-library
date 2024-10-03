// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';
import {UnderACM} from '../common/UnderACM.sol';

import {IApi3OracleReader, IBaseOracle} from '../interfaces/oracle/api3/IApi3OracleReader.sol';
import {ILsdApi3OracleReader} from '../interfaces/oracle/api3/ILsdApi3OracleReader.sol';
import {IApi3ServerV1} from '../interfaces/oracle/api3/IApi3ServerV1.sol';

import {SafeCast} from '@openzeppelin-contracts/utils/math/SafeCast.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';
import {IERC20Metadata} from '@openzeppelin-contracts/token/ERC20/extensions/IERC20Metadata.sol';
import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';

contract LsdApi3OracleReader is ILsdApi3OracleReader, UnderACM, Initializable {
    using SafeCast for int224;
    using UncheckedIncrement for uint;
    using Math for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GOVERNOR = keccak256('governor');

    // storages
    mapping(address => DataFeedInfo) public dataFeedInfos;
    address public api3OracleReader;

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
    /// @param _api3OracleReader api3 server v1 address
    function initialize(address _api3OracleReader) external initializer {
        api3OracleReader = _api3OracleReader;
    }

    // functions
    /// @inheritdoc IBaseOracle
    function getPrice_e36(address _token) external view returns (uint price_e36) {
        // load and check
        DataFeedInfo memory dataFeedInfo = dataFeedInfos[_token];
        _require(dataFeedInfo.dataFeedId != bytes32(0), Errors.DATAFEED_ID_NOT_SET);
        _require(dataFeedInfo.maxStaleTime != 0, Errors.MAX_STALETIME_NOT_SET);
        // get exchange rate from lsd info
        (int224 rate_e18, uint timestamp) = IApi3ServerV1(IApi3OracleReader(api3OracleReader).api3ServerV1())
            .readDataFeedWithId(dataFeedInfo.dataFeedId);
        // check if the last updated is not longer than the max stale time
        if (block.timestamp > timestamp) {
            _require(block.timestamp - timestamp <= dataFeedInfo.maxStaleTime, Errors.MAX_STALETIME_EXCEEDED);
        }
        // get quote token price from api3 oracle reader
        uint quotePrice_e36 = IApi3OracleReader(api3OracleReader).getPrice_e36(dataFeedInfo.quoteToken);
        price_e36 = rate_e18.toUint256().mulDiv(quotePrice_e36, ONE_E18);
    }

    /// @inheritdoc ILsdApi3OracleReader
    function setApi3OracleReader(address _api3OracleReader) external override onlyGovernor {
        api3OracleReader = _api3OracleReader;
    }

    /// @inheritdoc ILsdApi3OracleReader
    function setDataFeedIds(address[] calldata _tokens, bytes32[] calldata _dataFeedIds) external onlyGovernor {
        _require(_dataFeedIds.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);

        for (uint i; i < _dataFeedIds.length; i = i.uinc()) {
            dataFeedInfos[_tokens[i]].dataFeedId = _dataFeedIds[i];
            emit SetDataFeed(_tokens[i], _dataFeedIds[i]);
        }
    }

    /// @inheritdoc ILsdApi3OracleReader
    function setQuoteTokens(address[] calldata _tokens, address[] calldata _quoteTokens) external onlyGovernor {
        _require(_quoteTokens.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);

        for (uint i; i < _quoteTokens.length; i = i.uinc()) {
            dataFeedInfos[_tokens[i]].quoteToken = _quoteTokens[i];
            emit SetQuoteToken(_tokens[i], _quoteTokens[i]);
        }
    }

    /// @inheritdoc ILsdApi3OracleReader
    function setMaxStaleTimes(address[] calldata _tokens, uint96[] calldata _maxStaleTimes) external onlyGovernor {
        _require(_maxStaleTimes.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);

        for (uint i; i < _maxStaleTimes.length; i = i.uinc()) {
            dataFeedInfos[_tokens[i]].maxStaleTime = _maxStaleTimes[i];
            emit SetMaxStaleTime(_tokens[i], _maxStaleTimes[i]);
        }
    }
}

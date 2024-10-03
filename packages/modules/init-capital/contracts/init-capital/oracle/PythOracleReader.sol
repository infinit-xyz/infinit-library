// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {SafeCast} from '@openzeppelin-contracts/utils/math/SafeCast.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';
import {IERC20Metadata} from '@openzeppelin-contracts/token/ERC20/extensions/IERC20Metadata.sol';
import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';

import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';
import {UnderACM} from '../common/UnderACM.sol';

import {IPyth} from '../interfaces/oracle/pyth/IPyth.sol';
import {IPythOracleReader, IBaseOracle} from '../interfaces/oracle/pyth/IPythOracleReader.sol';

contract PythOracleReader is IPythOracleReader, UnderACM, Initializable {
    using UncheckedIncrement for uint;
    using SafeCast for uint;
    using SafeCast for int;
    using Math for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GOVERNOR = keccak256('governor');

    // storages
    mapping(address => bytes32) public priceIds; // @inheritdoc IPythOracleReader
    mapping(address => uint) public maxStaleTimes; // @inheritdoc IPythOracleReader
    address public pyth;

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
    /// @dev initialize contract and set pyth address
    /// @param _pyth pyth address
    function initialize(address _pyth) external initializer {
        pyth = _pyth;
        emit SetPyth(_pyth);
    }

    // functions
    /// @inheritdoc IPythOracleReader
    function setPriceIds(address[] calldata _tokens, bytes32[] calldata _priceIds) external onlyGovernor {
        _require(_priceIds.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _priceIds.length; i = i.uinc()) {
            priceIds[_tokens[i]] = _priceIds[i];
            emit SetPriceId(_tokens[i], _priceIds[i]);
        }
    }

    /// @inheritdoc IPythOracleReader
    function setPyth(address _pyth) external onlyGovernor {
        pyth = _pyth;
        emit SetPyth(_pyth);
    }

    /// @inheritdoc IPythOracleReader
    function setMaxStaleTimes(address[] calldata _tokens, uint[] calldata _maxStaleTimes) external onlyGovernor {
        _require(_maxStaleTimes.length == _tokens.length, Errors.ARRAY_LENGTH_MISMATCHED);

        for (uint i; i < _maxStaleTimes.length; i = i.uinc()) {
            maxStaleTimes[_tokens[i]] = _maxStaleTimes[i];
            emit SetMaxStaleTime(_tokens[i], _maxStaleTimes[i]);
        }
    }

    /// @inheritdoc IBaseOracle
    function getPrice_e36(address _token) external view returns (uint price_e36) {
        // load and check
        bytes32 priceId = priceIds[_token];
        uint maxStaleTime = maxStaleTimes[_token];
        _require(priceId != bytes32(0), Errors.NO_PRICE_ID);
        _require(maxStaleTime != 0, Errors.MAX_STALETIME_NOT_SET);

        // NOTE:
        // price: Price
        // conf: Confidence interval around the price
        // expo: Price exponent e.g. 10^8 -> expo = -8
        // publishTime: Unix timestamp describing when the price was published
        (int64 price,, int32 expo, uint64 publishTime) = IPyth(pyth).getPriceUnsafe(priceId);

        // check if the last updated is not longer than the max stale time
        _require(block.timestamp - publishTime <= maxStaleTime, Errors.MAX_STALETIME_EXCEEDED);

        // return as [USD_e36 per wei unit]
        price_e36 = int(price).toUint256() * 10 ** (36 - IERC20Metadata(_token).decimals() - uint(int(-expo)));
    }
}

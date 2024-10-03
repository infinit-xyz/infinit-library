// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';

import {UnderACM} from '../common/UnderACM.sol';

import {IInitOracle, IBaseOracle} from '../interfaces/oracle/IInitOracle.sol';
import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';

contract InitOracle is IInitOracle, UnderACM, Initializable {
    using UncheckedIncrement for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GOVERNOR = keccak256('governor');

    // storages
    mapping(address => address) public primarySources; // @inheritdoc IInitOracle
    mapping(address => address) public secondarySources; // @inheritdoc IInitOracle
    mapping(address => uint) public maxPriceDeviations_e18; // @inheritdoc IInitOracle

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
    /// @dev initialize the contract
    function initialize() external initializer {}

    // functions
    /// @inheritdoc IBaseOracle
    function getPrice_e36(address _token) public view returns (uint price_e36) {
        bool isPrimarySourceValid;
        bool isSecondarySourceValid;
        uint primaryPrice_e36;
        uint secondaryPrice_e36;

        // get price from primary source
        address primarySource = primarySources[_token];
        _require(primarySource != address(0), Errors.PRIMARY_SOURCE_NOT_SET);
        try IBaseOracle(primarySource).getPrice_e36(_token) returns (uint primaryPrice_e36_) {
            primaryPrice_e36 = primaryPrice_e36_;
            isPrimarySourceValid = true;
        } catch {}

        // get price from secondary source
        address secondarySource = secondarySources[_token];
        if (secondarySource != address(0)) {
            try IBaseOracle(secondarySource).getPrice_e36(_token) returns (uint secondaryPrice_e36_) {
                secondaryPrice_e36 = secondaryPrice_e36_;
                isSecondarySourceValid = true;
            } catch {}
        }

        // normal case: both sources are valid
        // check that the prices are not too deviated
        // abnormal case: one of the sources is invalid
        // using the valid source - prioritize the primary source
        // abnormal case: both sources are invalid
        // revert
        _require(isPrimarySourceValid || isSecondarySourceValid, Errors.NO_VALID_SOURCE);
        if (isPrimarySourceValid && isSecondarySourceValid) {
            // sort Price
            (uint minPrice_e36, uint maxPrice_e36) = primaryPrice_e36 < secondaryPrice_e36
                ? (primaryPrice_e36, secondaryPrice_e36)
                : (secondaryPrice_e36, primaryPrice_e36);

            // check deviation
            _require(
                (maxPrice_e36 * ONE_E18) / minPrice_e36 <= maxPriceDeviations_e18[_token], Errors.TOO_MUCH_DEVIATION
            );
        }
        price_e36 = isPrimarySourceValid ? primaryPrice_e36 : secondaryPrice_e36;
    }

    /// @inheritdoc IInitOracle
    function getPrices_e36(address[] calldata _tokens) external view returns (uint[] memory prices_e36) {
        prices_e36 = new uint[](_tokens.length);
        for (uint i; i < _tokens.length; i = i.uinc()) {
            prices_e36[i] = getPrice_e36(_tokens[i]);
        }
    }

    /// @inheritdoc IInitOracle
    function setPrimarySources(address[] calldata _tokens, address[] calldata _sources) external onlyGovernor {
        _require(_tokens.length == _sources.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _tokens.length; i = i.uinc()) {
            primarySources[_tokens[i]] = _sources[i];
            emit SetPrimarySource(_tokens[i], _sources[i]);
        }
    }

    /// @inheritdoc IInitOracle
    function setSecondarySources(address[] calldata _tokens, address[] calldata _sources) external onlyGovernor {
        _require(_tokens.length == _sources.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _tokens.length; i = i.uinc()) {
            secondarySources[_tokens[i]] = _sources[i];
            emit SetSecondarySource(_tokens[i], _sources[i]);
        }
    }

    /// @inheritdoc IInitOracle
    function setMaxPriceDeviations_e18(address[] calldata _tokens, uint[] calldata _maxPriceDeviations_e18)
        external
        onlyGovernor
    {
        _require(_tokens.length == _maxPriceDeviations_e18.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _tokens.length; i = i.uinc()) {
            // sanity check
            _require(_maxPriceDeviations_e18[i] >= ONE_E18, Errors.MAX_PRICE_DEVIATION_TOO_LOW);

            maxPriceDeviations_e18[_tokens[i]] = _maxPriceDeviations_e18[i];
            emit SetMaxPriceDeviation_e18(_tokens[i], _maxPriceDeviations_e18[i]);
        }
    }
}

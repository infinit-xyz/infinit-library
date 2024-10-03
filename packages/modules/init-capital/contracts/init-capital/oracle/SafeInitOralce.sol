pragma solidity ^0.8.19;

import '../interfaces/oracle/IInitOracle.sol';
contract SafeInitOracle {

    address public immutable initOracle;

    uint private constant ONE_E18 = 1e18;


    constructor(address _initOracle) {
        initOracle = _initOracle;
    }

    function getSafePrice_e36(address _token) public view returns(uint price_e36, bool isValid) {
        bool isPrimarySourceValid;
        bool isSecondarySourceValid;
        uint primaryPrice_e36;
        uint secondaryPrice_e36;

        // get price from primary source
        address primarySource = IInitOracle(initOracle).primarySources(_token);
        // address primarySource = primarySources[_token];
        // _require(primarySource != address(0), Errors.PRIMARY_SOURCE_NOT_SET);
        try IBaseOracle(primarySource).getPrice_e36(_token) returns (uint primaryPrice_e36_) {
            primaryPrice_e36 = primaryPrice_e36_;
            isPrimarySourceValid = true;
        } catch {

        }

        // get price from secondary source
        address secondarySource = IInitOracle(initOracle).secondarySources(_token);
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
        // _require(isPrimarySourceValid || isSecondarySourceValid, Errors.NO_VALID_SOURCE);
        isValid = isPrimarySourceValid || isSecondarySourceValid;
        if (isPrimarySourceValid && isSecondarySourceValid) {
            // sort Price
            (uint minPrice_e36, uint maxPrice_e36) = primaryPrice_e36 < secondaryPrice_e36
                ? (primaryPrice_e36, secondaryPrice_e36)
                : (secondaryPrice_e36, primaryPrice_e36);

            isValid = (maxPrice_e36 * ONE_E18) / minPrice_e36 <= IInitOracle(initOracle).maxPriceDeviations_e18(_token);
            // check deviation
            // _require(
            //     (maxPrice_e36 * ONE_E18) / minPrice_e36 <= maxPriceDeviations_e18[_token], Errors.TOO_MUCH_DEVIATION
            // );
        }
        price_e36 = isPrimarySourceValid ? primaryPrice_e36 : secondaryPrice_e36;
    }
}
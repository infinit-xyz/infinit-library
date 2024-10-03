// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @notice For maximum readability, error code must be a hex-encoded ASCII in the form {#DDD}.
/// @dev Reverts if the _condition is false.
/// @param _condition boolean condition required to be true.
/// @param _errorCode hex-encoded ASCII error code
function _require(bool _condition, uint32 _errorCode) pure {
    if (!_condition) revert(string(abi.encodePacked(_errorCode)));
}

library Errors {
    // Common
    uint32 internal constant ZERO_VALUE = 0x23313030; // hex-encoded ASCII of '#100'
    uint32 internal constant NOT_INIT_CORE = 0x23313031; // hex-encoded ASCII of '#101'
    uint32 internal constant SLIPPAGE_CONTROL = 0x23313032; // hex-encoded ASCII of '#102'
    uint32 internal constant CALL_FAILED = 0x23313033; // hex-encoded ASCII of '#103'
    uint32 internal constant NOT_OWNER = 0x23313034; // hex-encoded ASCII of '#104'
    uint32 internal constant NOT_WNATIVE = 0x23313035; // hex-encoded ASCII of '#105'
    uint32 internal constant ALREADY_SET = 0x23313036; // hex-encoded ASCII of '#106'
    uint32 internal constant NOT_WHITELISTED = 0x23313037; // hex-encoded ASCII of '#107'

    // Input
    uint32 internal constant ARRAY_LENGTH_MISMATCHED = 0x23323030; // hex-encoded ASCII of '#200'
    uint32 internal constant INPUT_TOO_LOW = 0x23323031; // hex-encoded ASCII of '#201'
    uint32 internal constant INPUT_TOO_HIGH = 0x23323032; // hex-encoded ASCII of '#202'
    uint32 internal constant INVALID_INPUT = 0x23323033; // hex-encoded ASCII of '#203'
    uint32 internal constant INVALID_TOKEN_IN = 0x23323034; // hex-encoded ASCII of '#204'
    uint32 internal constant INVALID_TOKEN_OUT = 0x23323035; // hex-encoded ASCII of '#205'
    uint32 internal constant NOT_SORTED_OR_DUPLICATED_INPUT = 0x23323036; // hex-encoded ASCII of '#206'

    // Core
    uint32 internal constant POSITION_NOT_HEALTHY = 0x23333030; // hex-encoded ASCII of '#300'
    uint32 internal constant POSITION_NOT_FOUND = 0x23333031; // hex-encoded ASCII of '#301'
    uint32 internal constant LOCKED_MULTICALL = 0x23333032; // hex-encoded ASCII of '#302'
    uint32 internal constant POSITION_HEALTHY = 0x23333033; // hex-encoded ASCII of '#303'
    uint32 internal constant INVALID_HEALTH_AFTER_LIQUIDATION = 0x23333034; // hex-encoded ASCII of '#304'
    uint32 internal constant FLASH_PAUSED = 0x23333035; // hex-encoded ASCII of '#305'
    uint32 internal constant INVALID_FLASHLOAN = 0x23333036; // hex-encoded ASCII of '#306'
    uint32 internal constant NOT_AUTHORIZED = 0x23333037; // hex-encoded ASCII of '#307'
    uint32 internal constant INVALID_CALLBACK_ADDRESS = 0x23333038; // hex-encoded ASCII of '#308'

    // Lending Pool
    uint32 internal constant MINT_PAUSED = 0x23343030; // hex-encoded ASCII of '#400'
    uint32 internal constant REDEEM_PAUSED = 0x23343031; // hex-encoded ASCII of '#401'
    uint32 internal constant BORROW_PAUSED = 0x23343032; // hex-encoded ASCII of '#402'
    uint32 internal constant REPAY_PAUSED = 0x23343033; // hex-encoded ASCII of '#403'
    uint32 internal constant NOT_ENOUGH_CASH = 0x23343034; // hex-encoded ASCII of '#404'
    uint32 internal constant INVALID_AMOUNT_TO_REPAY = 0x23343035; // hex-encoded ASCII of '#405'
    uint32 internal constant SUPPLY_CAP_REACHED = 0x23343036; // hex-encoded ASCII of '#406'
    uint32 internal constant BORROW_CAP_REACHED = 0x23343037; // hex-encoded ASCII of '#407'

    // Config
    uint32 internal constant INVALID_MODE = 0x23353030; // hex-encoded ASCII of '#500'
    uint32 internal constant TOKEN_NOT_WHITELISTED = 0x23353031; // hex-encoded ASCII of '#501'
    uint32 internal constant INVALID_FACTOR = 0x23353032; // hex-encoded ASCII of '#502'

    // Position Manager
    uint32 internal constant COLLATERALIZE_PAUSED = 0x23363030; // hex-encoded ASCII of '#600'
    uint32 internal constant DECOLLATERALIZE_PAUSED = 0x23363031; // hex-encoded ASCII of '#601'
    uint32 internal constant MAX_COLLATERAL_COUNT_REACHED = 0x23363032; // hex-encoded ASCII of '#602'
    uint32 internal constant NOT_CONTAIN = 0x23363033; // hex-encoded ASCII of '#603'
    uint32 internal constant ALREADY_COLLATERALIZED = 0x23363034; // hex-encoded ASCII of '#604'

    // Oracle
    uint32 internal constant NO_VALID_SOURCE = 0x23373030; // hex-encoded ASCII of '#700'
    uint32 internal constant TOO_MUCH_DEVIATION = 0x23373031; // hex-encoded ASCII of '#701'
    uint32 internal constant MAX_PRICE_DEVIATION_TOO_LOW = 0x23373032; // hex-encoded ASCII of '#702'
    uint32 internal constant NO_PRICE_ID = 0x23373033; // hex-encoded ASCII of '#703'
    uint32 internal constant PYTH_CONFIG_NOT_SET = 0x23373034; // hex-encoded ASCII of '#704'
    uint32 internal constant DATAFEED_ID_NOT_SET = 0x23373035; // hex-encoded ASCII of '#705'
    uint32 internal constant MAX_STALETIME_NOT_SET = 0x23373036; // hex-encoded ASCII of '#706'
    uint32 internal constant MAX_STALETIME_EXCEEDED = 0x23373037; // hex-encoded ASCII of '#707'
    uint32 internal constant PRIMARY_SOURCE_NOT_SET = 0x23373038; // hex-encoded ASCII of '#708'
    uint32 internal constant DATAFEED_PROXY_NOT_SET = 0x23373039; // hex-encoded ASCII of '#709'

    // Risk Manager
    uint32 internal constant DEBT_CEILING_EXCEEDED = 0x23383030; // hex-encoded ASCII of '#800'

    // Misc
    uint32 internal constant INCORRECT_PAIR = 0x23393030; // hex-encoded ASCII of '#900'
    uint32 internal constant ONLY_CLAIMER = 0x23393031; // hex-encoded ASCII of '#901'
    uint32 internal constant ONLY_WLP_MOE_V2 = 0x23393032; // hex-encoded ASCII of '#902'
    uint32 internal constant LIMIT_LENGTH_EXCEED = 0x23393033; // hex-encoded ASCII of '#903'

    uint32 internal constant UNIMPLEMENTED = 0x23393939; // hex-encoded ASCII of '#999'
}

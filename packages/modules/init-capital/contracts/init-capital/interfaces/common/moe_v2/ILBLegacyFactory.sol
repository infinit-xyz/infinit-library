// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

import {ILBLegacyPair} from './ILBLegacyPair.sol';
import {IPendingOwnable} from './IPendingOwnable.sol';

/// @title Liquidity Book Factory Interface
/// @author Trader Joe
/// @notice Required interface of LBFactory contract
interface ILBLegacyFactory is IPendingOwnable {
    /// @dev Structure to store the LBPair information, such as:
    /// - binStep: The bin step of the LBPair
    /// - LBPair: The address of the LBPair
    /// - createdByOwner: Whether the pair was created by the owner of the factory
    /// - ignoredForRouting: Whether the pair is ignored for routing or not. An ignored pair will not be explored during routes finding
    struct LBPairInformation {
        uint16 binStep;
        ILBLegacyPair LBPair;
        bool createdByOwner;
        bool ignoredForRouting;
    }

    event LBPairCreated(
        IERC20 indexed tokenX, IERC20 indexed tokenY, uint indexed binStep, ILBLegacyPair LBPair, uint pid
    );

    event FeeRecipientSet(address oldRecipient, address newRecipient);

    event FlashLoanFeeSet(uint oldFlashLoanFee, uint newFlashLoanFee);

    event FeeParametersSet(
        address indexed sender,
        ILBLegacyPair indexed LBPair,
        uint binStep,
        uint baseFactor,
        uint filterPeriod,
        uint decayPeriod,
        uint reductionFactor,
        uint variableFeeControl,
        uint protocolShare,
        uint maxVolatilityAccumulator
    );

    event FactoryLockedStatusUpdated(bool unlocked);

    event LBPairImplementationSet(address oldLBPairImplementation, address LBPairImplementation);

    event LBPairIgnoredStateChanged(ILBLegacyPair indexed LBPair, bool ignored);

    event PresetSet(
        uint indexed binStep,
        uint baseFactor,
        uint filterPeriod,
        uint decayPeriod,
        uint reductionFactor,
        uint variableFeeControl,
        uint protocolShare,
        uint maxVolatilityAccumulator,
        uint sampleLifetime
    );

    event PresetRemoved(uint indexed binStep);

    event QuoteAssetAdded(IERC20 indexed quoteAsset);

    event QuoteAssetRemoved(IERC20 indexed quoteAsset);

    function MAX_FEE() external pure returns (uint);

    function MIN_BIN_STEP() external pure returns (uint);

    function MAX_BIN_STEP() external pure returns (uint);

    function MAX_PROTOCOL_SHARE() external pure returns (uint);

    function LBPairImplementation() external view returns (address);

    function getNumberOfQuoteAssets() external view returns (uint);

    function getQuoteAsset(uint index) external view returns (IERC20);

    function isQuoteAsset(IERC20 token) external view returns (bool);

    function feeRecipient() external view returns (address);

    function flashLoanFee() external view returns (uint);

    function creationUnlocked() external view returns (bool);

    function allLBPairs(uint id) external returns (ILBLegacyPair);

    function getNumberOfLBPairs() external view returns (uint);

    function getLBPairInformation(IERC20 tokenX, IERC20 tokenY, uint binStep)
        external
        view
        returns (LBPairInformation memory);

    function getPreset(uint16 binStep)
        external
        view
        returns (
            uint baseFactor,
            uint filterPeriod,
            uint decayPeriod,
            uint reductionFactor,
            uint variableFeeControl,
            uint protocolShare,
            uint maxAccumulator,
            uint sampleLifetime
        );

    function getAllBinSteps() external view returns (uint[] memory presetsBinStep);

    function getAllLBPairs(IERC20 tokenX, IERC20 tokenY)
        external
        view
        returns (LBPairInformation[] memory LBPairsBinStep);

    function setLBPairImplementation(address LBPairImplementation) external;

    function createLBPair(IERC20 tokenX, IERC20 tokenY, uint24 activeId, uint16 binStep)
        external
        returns (ILBLegacyPair pair);

    function setLBPairIgnored(IERC20 tokenX, IERC20 tokenY, uint binStep, bool ignored) external;

    function setPreset(
        uint16 binStep,
        uint16 baseFactor,
        uint16 filterPeriod,
        uint16 decayPeriod,
        uint16 reductionFactor,
        uint24 variableFeeControl,
        uint16 protocolShare,
        uint24 maxVolatilityAccumulator,
        uint16 sampleLifetime
    ) external;

    function removePreset(uint16 binStep) external;

    function setFeesParametersOnPair(
        IERC20 tokenX,
        IERC20 tokenY,
        uint16 binStep,
        uint16 baseFactor,
        uint16 filterPeriod,
        uint16 decayPeriod,
        uint16 reductionFactor,
        uint24 variableFeeControl,
        uint16 protocolShare,
        uint24 maxVolatilityAccumulator
    ) external;

    function setFeeRecipient(address feeRecipient) external;

    function setFlashLoanFee(uint flashLoanFee) external;

    function setFactoryLockedState(bool locked) external;

    function addQuoteAsset(IERC20 quoteAsset) external;

    function removeQuoteAsset(IERC20 quoteAsset) external;

    function forceDecay(ILBLegacyPair LBPair) external;
}

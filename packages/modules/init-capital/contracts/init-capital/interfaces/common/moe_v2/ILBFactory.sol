// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

import {ILBPair} from './ILBPair.sol';
import {IPendingOwnable} from './IPendingOwnable.sol';

/**
 * @title Liquidity Book Factory Interface
 * @author Trader Joe
 * @notice Required interface of LBFactory contract
 */
interface ILBFactory is IPendingOwnable {
    error LBFactory__IdenticalAddresses(IERC20 token);
    error LBFactory__QuoteAssetNotWhitelisted(IERC20 quoteAsset);
    error LBFactory__QuoteAssetAlreadyWhitelisted(IERC20 quoteAsset);
    error LBFactory__AddressZero();
    error LBFactory__LBPairAlreadyExists(IERC20 tokenX, IERC20 tokenY, uint _binStep);
    error LBFactory__LBPairDoesNotExist(IERC20 tokenX, IERC20 tokenY, uint binStep);
    error LBFactory__LBPairNotCreated(IERC20 tokenX, IERC20 tokenY, uint binStep);
    error LBFactory__FlashLoanFeeAboveMax(uint fees, uint maxFees);
    error LBFactory__BinStepTooLow(uint binStep);
    error LBFactory__PresetIsLockedForUsers(address user, uint binStep);
    error LBFactory__LBPairIgnoredIsAlreadyInTheSameState();
    error LBFactory__BinStepHasNoPreset(uint binStep);
    error LBFactory__PresetOpenStateIsAlreadyInTheSameState();
    error LBFactory__SameFeeRecipient(address feeRecipient);
    error LBFactory__SameFlashLoanFee(uint flashLoanFee);
    error LBFactory__LBPairSafetyCheckFailed(address LBPairImplementation);
    error LBFactory__SameImplementation(address LBPairImplementation);
    error LBFactory__ImplementationNotSet();

    /**
     * @dev Structure to store the LBPair information, such as:
     * binStep: The bin step of the LBPair
     * LBPair: The address of the LBPair
     * createdByOwner: Whether the pair was created by the owner of the factory
     * ignoredForRouting: Whether the pair is ignored for routing or not. An ignored pair will not be explored during routes finding
     */
    struct LBPairInformation {
        uint16 binStep;
        ILBPair LBPair;
        bool createdByOwner;
        bool ignoredForRouting;
    }

    event LBPairCreated(IERC20 indexed tokenX, IERC20 indexed tokenY, uint indexed binStep, ILBPair LBPair, uint pid);

    event FeeRecipientSet(address oldRecipient, address newRecipient);

    event FlashLoanFeeSet(uint oldFlashLoanFee, uint newFlashLoanFee);

    event LBPairImplementationSet(address oldLBPairImplementation, address LBPairImplementation);

    event LBPairIgnoredStateChanged(ILBPair indexed LBPair, bool ignored);

    event PresetSet(
        uint indexed binStep,
        uint baseFactor,
        uint filterPeriod,
        uint decayPeriod,
        uint reductionFactor,
        uint variableFeeControl,
        uint protocolShare,
        uint maxVolatilityAccumulator
    );

    event PresetOpenStateChanged(uint indexed binStep, bool indexed isOpen);

    event PresetRemoved(uint indexed binStep);

    event QuoteAssetAdded(IERC20 indexed quoteAsset);

    event QuoteAssetRemoved(IERC20 indexed quoteAsset);

    function getMinBinStep() external pure returns (uint);

    function getFeeRecipient() external view returns (address);

    function getMaxFlashLoanFee() external pure returns (uint);

    function getFlashLoanFee() external view returns (uint);

    function getLBPairImplementation() external view returns (address);

    function getNumberOfLBPairs() external view returns (uint);

    function getLBPairAtIndex(uint id) external returns (ILBPair);

    function getNumberOfQuoteAssets() external view returns (uint);

    function getQuoteAssetAtIndex(uint index) external view returns (IERC20);

    function isQuoteAsset(IERC20 token) external view returns (bool);

    function getLBPairInformation(IERC20 tokenX, IERC20 tokenY, uint binStep)
        external
        view
        returns (LBPairInformation memory);

    function getPreset(uint binStep)
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
            bool isOpen
        );

    function getAllBinSteps() external view returns (uint[] memory presetsBinStep);

    function getOpenBinSteps() external view returns (uint[] memory openBinStep);

    function getAllLBPairs(IERC20 tokenX, IERC20 tokenY)
        external
        view
        returns (LBPairInformation[] memory LBPairsBinStep);

    function setLBPairImplementation(address lbPairImplementation) external;

    function createLBPair(IERC20 tokenX, IERC20 tokenY, uint24 activeId, uint16 binStep)
        external
        returns (ILBPair pair);

    function setLBPairIgnored(IERC20 tokenX, IERC20 tokenY, uint16 binStep, bool ignored) external;

    function setPreset(
        uint16 binStep,
        uint16 baseFactor,
        uint16 filterPeriod,
        uint16 decayPeriod,
        uint16 reductionFactor,
        uint24 variableFeeControl,
        uint16 protocolShare,
        uint24 maxVolatilityAccumulator,
        bool isOpen
    ) external;

    function setPresetOpenState(uint16 binStep, bool isOpen) external;

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

    function addQuoteAsset(IERC20 quoteAsset) external;

    function removeQuoteAsset(IERC20 quoteAsset) external;

    function forceDecay(ILBPair lbPair) external;
}

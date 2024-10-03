// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

import {ILBLegacyToken} from './ILBLegacyToken.sol';

/// @title Liquidity Book Pair V2 Interface
/// @author Trader Joe
/// @notice Required interface of LBPair contract
interface ILBLegacyPair is ILBLegacyToken {
    /// @dev Structure to store the protocol fees:
    /// - binStep: The bin step
    /// - baseFactor: The base factor
    /// - filterPeriod: The filter period, where the fees stays constant
    /// - decayPeriod: The decay period, where the fees are halved
    /// - reductionFactor: The reduction factor, used to calculate the reduction of the accumulator
    /// - variableFeeControl: The variable fee control, used to control the variable fee, can be 0 to disable them
    /// - protocolShare: The share of fees sent to protocol
    /// - maxVolatilityAccumulated: The max value of volatility accumulated
    /// - volatilityAccumulated: The value of volatility accumulated
    /// - volatilityReference: The value of volatility reference
    /// - indexRef: The index reference
    /// - time: The last time the accumulator was called
    struct FeeParameters {
        // 144 lowest bits in slot
        uint16 binStep;
        uint16 baseFactor;
        uint16 filterPeriod;
        uint16 decayPeriod;
        uint16 reductionFactor;
        uint24 variableFeeControl;
        uint16 protocolShare;
        uint24 maxVolatilityAccumulated;
        // 112 highest bits in slot
        uint24 volatilityAccumulated;
        uint24 volatilityReference;
        uint24 indexRef;
        uint40 time;
    }

    /// @dev Structure used during swaps to distributes the fees:
    /// - total: The total amount of fees
    /// - protocol: The amount of fees reserved for protocol
    struct FeesDistribution {
        uint128 total;
        uint128 protocol;
    }

    /// @dev Structure to store the reserves of bins:
    /// - reserveX: The current reserve of tokenX of the bin
    /// - reserveY: The current reserve of tokenY of the bin
    struct Bin {
        uint112 reserveX;
        uint112 reserveY;
        uint accTokenXPerShare;
        uint accTokenYPerShare;
    }

    /// @dev Structure to store the information of the pair such as:
    /// slot0:
    /// - activeId: The current id used for swaps, this is also linked with the price
    /// - reserveX: The sum of amounts of tokenX across all bins
    /// slot1:
    /// - reserveY: The sum of amounts of tokenY across all bins
    /// - oracleSampleLifetime: The lifetime of an oracle sample
    /// - oracleSize: The current size of the oracle, can be increase by users
    /// - oracleActiveSize: The current active size of the oracle, composed only from non empty data sample
    /// - oracleLastTimestamp: The current last timestamp at which a sample was added to the circular buffer
    /// - oracleId: The current id of the oracle
    /// slot2:
    /// - feesX: The current amount of fees to distribute in tokenX (total, protocol)
    /// slot3:
    /// - feesY: The current amount of fees to distribute in tokenY (total, protocol)
    struct PairInformation {
        uint24 activeId;
        uint136 reserveX;
        uint136 reserveY;
        uint16 oracleSampleLifetime;
        uint16 oracleSize;
        uint16 oracleActiveSize;
        uint40 oracleLastTimestamp;
        uint16 oracleId;
        FeesDistribution feesX;
        FeesDistribution feesY;
    }

    /// @dev Structure to store the debts of users
    /// - debtX: The tokenX's debt
    /// - debtY: The tokenY's debt
    struct Debts {
        uint debtX;
        uint debtY;
    }

    /// @dev Structure to store fees:
    /// - tokenX: The amount of fees of token X
    /// - tokenY: The amount of fees of token Y
    struct Fees {
        uint128 tokenX;
        uint128 tokenY;
    }

    /// @dev Structure to minting informations:
    /// - amountXIn: The amount of token X sent
    /// - amountYIn: The amount of token Y sent
    /// - amountXAddedToPair: The amount of token X that have been actually added to the pair
    /// - amountYAddedToPair: The amount of token Y that have been actually added to the pair
    /// - activeFeeX: Fees X currently generated
    /// - activeFeeY: Fees Y currently generated
    /// - totalDistributionX: Total distribution of token X. Should be 1e18 (100%) or 0 (0%)
    /// - totalDistributionY: Total distribution of token Y. Should be 1e18 (100%) or 0 (0%)
    /// - id: Id of the current working bin when looping on the distribution array
    /// - amountX: The amount of token X deposited in the current bin
    /// - amountY: The amount of token Y deposited in the current bin
    /// - distributionX: Distribution of token X for the current working bin
    /// - distributionY: Distribution of token Y for the current working bin
    struct MintInfo {
        uint amountXIn;
        uint amountYIn;
        uint amountXAddedToPair;
        uint amountYAddedToPair;
        uint activeFeeX;
        uint activeFeeY;
        uint totalDistributionX;
        uint totalDistributionY;
        uint id;
        uint amountX;
        uint amountY;
        uint distributionX;
        uint distributionY;
    }

    event Swap(
        address indexed sender,
        address indexed recipient,
        uint indexed id,
        bool swapForY,
        uint amountIn,
        uint amountOut,
        uint volatilityAccumulated,
        uint fees
    );

    event FlashLoan(address indexed sender, address indexed receiver, IERC20 token, uint amount, uint fee);

    event CompositionFee(address indexed sender, address indexed recipient, uint indexed id, uint feesX, uint feesY);

    event DepositedToBin(
        address indexed sender, address indexed recipient, uint indexed id, uint amountX, uint amountY
    );

    event WithdrawnFromBin(
        address indexed sender, address indexed recipient, uint indexed id, uint amountX, uint amountY
    );

    event FeesCollected(address indexed sender, address indexed recipient, uint amountX, uint amountY);

    event ProtocolFeesCollected(address indexed sender, address indexed recipient, uint amountX, uint amountY);

    event OracleSizeIncreased(uint previousSize, uint newSize);

    function tokenX() external view returns (IERC20);

    function tokenY() external view returns (IERC20);

    function factory() external view returns (address);

    function getReservesAndId() external view returns (uint reserveX, uint reserveY, uint activeId);

    function getGlobalFees()
        external
        view
        returns (uint128 feesXTotal, uint128 feesYTotal, uint128 feesXProtocol, uint128 feesYProtocol);

    function getOracleParameters()
        external
        view
        returns (
            uint oracleSampleLifetime,
            uint oracleSize,
            uint oracleActiveSize,
            uint oracleLastTimestamp,
            uint oracleId,
            uint min,
            uint max
        );

    function getOracleSampleFrom(uint timeDelta)
        external
        view
        returns (uint cumulativeId, uint cumulativeAccumulator, uint cumulativeBinCrossed);

    function feeParameters() external view returns (FeeParameters memory);

    function findFirstNonEmptyBinId(uint24 id_, bool sentTokenY) external view returns (uint24 id);

    function getBin(uint24 id) external view returns (uint reserveX, uint reserveY);

    function pendingFees(address account, uint[] memory ids) external view returns (uint amountX, uint amountY);

    function swap(bool sentTokenY, address to) external returns (uint amountXOut, uint amountYOut);

    function flashLoan(address receiver, IERC20 token, uint amount, bytes calldata data) external;

    function mint(uint[] calldata ids, uint[] calldata distributionX, uint[] calldata distributionY, address to)
        external
        returns (uint amountXAddedToPair, uint amountYAddedToPair, uint[] memory liquidityMinted);

    function burn(uint[] calldata ids, uint[] calldata amounts, address to)
        external
        returns (uint amountX, uint amountY);

    function increaseOracleLength(uint16 newSize) external;

    function collectFees(address account, uint[] calldata ids) external returns (uint amountX, uint amountY);

    function collectProtocolFees() external returns (uint128 amountX, uint128 amountY);

    function setFeesParameters(bytes32 packedFeeParameters) external;

    function forceDecay() external;

    function initialize(
        IERC20 tokenX,
        IERC20 tokenY,
        uint24 activeId,
        uint16 sampleLifetime,
        bytes32 packedFeeParameters
    ) external;
}

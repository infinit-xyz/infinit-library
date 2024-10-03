// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {ILBTokenHolder} from './ILBTokenHolder.sol';

interface IWLpMoeV2 {
    event SetWhitelistedMoeRewarders(address[] wlMoeRewarder, bool status);
    event SetLimitBinLength(uint binLength);
    event SetMaxLiquidityPerShare_x128(uint maxLiquidityPerShare_x128);
    event SetBinMaxLiquidityPerShares_x128(
        address indexed lbToken, uint24[] binIds, uint[] binMaxLiquidityPerShares_x128
    );

    struct LBPosition {
        address lbToken;
        uint balance;
        ILBTokenHolder lbHolder;
        uint[] binIds;
        uint[] binIdShares_x128;
    }

    /// @dev get the position bins and shares from wrap id
    /// @param _id wrap id
    /// @return binIds list of bin id for the deposited position
    /// @return binIdShares_x128 list of bin id's shares for the deposited position
    function getPosBinIdsAndShares(uint _id)
        external
        view
        returns (uint[] memory binIds, uint[] memory binIdShares_x128);

    /// @dev _id wrap id
    /// @return lbHolder the lbHolder contract address
    function posLbHolder(uint _id) external returns (ILBTokenHolder lbHolder);

    /// @notice limit the number of lp bin ids to wrap to prevent the out of gas
    /// @dev get the limit bins length to wrap the lp
    /// @return limitBinLength limit bins length to wrap
    function limitBinLength() external returns (uint limitBinLength);

    /// @dev max L/TS allow for global
    /// @return maxLiquidityPerShare_x128
    function maxLiquidityPerShare_x128() external returns (uint maxLiquidityPerShare_x128);

    /// @dev max L/TS allow for each LBToken binIds
    /// @param _lbToken LBToken's address
    /// @param _binId LBToken's binId
    /// @return binMaxLiquidityPerShare_x128
    function binMaxLiquidityPerShares_x128(address _lbToken, uint24 _binId)
        external
        returns (uint binMaxLiquidityPerShare_x128);

    /// @dev get the moe's rewarder address
    /// @param _moeRewarder moe's rewarder address
    /// @return isRewarderWhitelisted whether the rewarder is whitelisted
    function wlMoeRewarders(address _moeRewarder) external view returns (bool isRewarderWhitelisted);

    /// @dev set new moe's rewarder address
    /// @param _moeRewarders Moe's rewarder addresses
    /// @param _status whitelisted status to set to
    function setWhitelistedMoeRewarders(address[] calldata _moeRewarders, bool _status) external;

    /// @dev set new limit bin length
    /// @param _limitBinLength new limit bin length
    function setLimitBinLength(uint _limitBinLength) external;

    /// @notice max liquidity per share in the 128.128
    /// @dev set new max liquidity per share (L/TS)
    /// @param _maxLiquidityPerShare_x128 new max liquidity per share
    function setMaxLiquidityPerShares_x128(uint _maxLiquidityPerShare_x128) external;

    /// @notice max liquidity per share in the 128.128
    /// @dev set each bin new max liquidity per share (L/TS)
    /// @param _lbToken lbToken address
    /// @param _binIds a list of binIds
    /// @param _binMaxLiquidityPerShares_x128 a list of new bin max liquidity per shares
    function setBinMaxLiquidityPerShares_x128(
        address _lbToken,
        uint24[] calldata _binIds,
        uint[] calldata _binMaxLiquidityPerShares_x128
    ) external;
}

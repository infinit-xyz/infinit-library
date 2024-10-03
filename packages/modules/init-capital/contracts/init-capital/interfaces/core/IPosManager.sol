// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {EnumerableSet} from '@openzeppelin-contracts/utils/structs/EnumerableSet.sol';

/// @title Position Interface
interface IPosManager {
    event SetMaxCollCount(uint maxCollCount);

    struct PosInfo {
        address viewer; // viewer address
        uint16 mode; // position mode
    }

    // NOTE: extra info for hooks (not used in core)
    struct PosBorrExtraInfo {
        uint128 totalInterest; // total accrued interest since the position is created
        uint128 lastDebtAmt; // position's debt amount after the last interaction
    }

    struct PosCollInfo {
        EnumerableSet.AddressSet collTokens; // enumerable set of collateral tokens
        mapping(address => uint) collAmts; // collateral token to collateral amts mapping
        EnumerableSet.AddressSet wLps; // enumerable set of collateral wlps
        mapping(address => EnumerableSet.UintSet) ids; // wlp address to enumerable set of ids mapping
        uint8 collCount; // current collateral count (erc20 + wlp)
        uint8 wLpCount; // current collateral count (wlp)
    }

    struct PosBorrInfo {
        EnumerableSet.AddressSet pools; // enumerable set of borrow tokens
        mapping(address => uint) debtShares; // debt token to debt shares mapping
        mapping(address => PosBorrExtraInfo) borrExtraInfos; // debt token to extra info mapping
    }

    /// @dev get the next nonce of the owner for calculating the next position id
    /// @param _owner the position owner
    /// @return nextNonce the next nonce of the position owner
    function nextNonces(address _owner) external view returns (uint nextNonce);

    /// @dev get core address
    function core() external view returns (address core);

    /// @dev get pending reward token amts for the pos id
    /// @param _posId pos id
    /// @param _rewardToken reward token
    /// @return amt reward token amt
    function pendingRewards(uint _posId, address _rewardToken) external view returns (uint amt);

    /// @dev get whether the wlp is already collateralized to a position
    /// @param _wLp wlp address
    /// @param _tokenId wlp token id
    /// @return whether the wlp is already collateralized to a position
    function isCollateralized(address _wLp, uint _tokenId) external view returns (bool);

    /// @dev get the position borrowed info (excluding the extra info)
    /// @param _posId position id
    /// @return pools the borrowed pool list
    ///         debtShares the debt shares list of the borrowed pools
    function getPosBorrInfo(uint _posId) external view returns (address[] memory pools, uint[] memory debtShares);

    /// @dev get the position borrowed extra info
    /// @param _posId position id
    /// @param _pool borrowed pool address
    /// @return totalInterest total accrued interest since the position is created
    ///         lastDebtAmt position's debt amount after the last interaction
    function getPosBorrExtraInfo(uint _posId, address _pool)
        external
        view
        returns (uint totalInterest, uint lastDebtAmt);

    /// @dev get the position collateral info
    /// @param _posId position id
    /// @return pools the collateral pool adddres list
    ///         amts collateral amts of the collateral pools
    ///         wLps the collateral wlp list
    ///         ids the ids of the collateral wlp list
    ///         wLpAmts the amounts of the collateral wlp list
    function getPosCollInfo(uint _posId)
        external
        view
        returns (
            address[] memory pools,
            uint[] memory amts,
            address[] memory wLps,
            uint[][] memory ids,
            uint[][] memory wLpAmts
        );

    /// @dev get pool's collateral amount for the position
    /// @param _posId position id
    /// @param _pool collateral pool address
    /// @return amt collateral amount
    function getCollAmt(uint _posId, address _pool) external view returns (uint amt);

    /// @dev get wrapped lp collateral amount for the position
    /// @param _posId position id
    /// @param _wLp collateral wlp address
    /// @param _tokenId collateral wlp token id
    /// @return amt collateral amount
    function getCollWLpAmt(uint _posId, address _wLp, uint _tokenId) external view returns (uint amt);

    /// @dev get position's collateral count
    /// @param _posId position id
    /// @return collCount position's collateral count
    function getPosCollCount(uint _posId) external view returns (uint8 collCount);

    /// @dev get position's wLp count
    /// @param _posId position id
    function getPosCollWLpCount(uint _posId) external view returns (uint8 wLpCount);

    /// @dev get position info
    /// @param _posId position id
    /// @return viewerAddress position's viewer address
    ///         mode position's mode
    function getPosInfo(uint _posId) external view returns (address viewerAddress, uint16 mode);

    /// @dev get position mode
    /// @param _posId position id
    /// @return mode position's mode
    function getPosMode(uint _posId) external view returns (uint16 mode);

    /// @dev get pool's debt shares for the position
    /// @param _posId position id
    /// @param _pool lending pool address
    /// @return debtShares debt shares
    function getPosDebtShares(uint _posId, address _pool) external view returns (uint debtShares);

    /// @dev get pos id at index corresponding to the viewer address (reverse mapping)
    /// @param _viewer viewer address
    /// @param _index index
    /// @return posId pos id
    function getViewerPosIdsAt(address _viewer, uint _index) external view returns (uint posId);

    /// @dev get pos id length corresponding to the viewer address (reverse mapping)
    /// @param _viewer viewer address
    /// @return length pos ids length
    function getViewerPosIdsLength(address _viewer) external view returns (uint length);

    /// @notice only core can call this function
    /// @dev update pool's debt share
    /// @param _posId position id
    /// @param _pool lending pool address
    /// @param _debtShares  new debt shares
    function updatePosDebtShares(uint _posId, address _pool, int _debtShares) external;

    /// @notice only core can call this function
    /// @dev update position mode
    /// @param _posId position id
    /// @param _mode new position mode to set to
    function updatePosMode(uint _posId, uint16 _mode) external;

    /// @notice only core can call this function
    /// @dev add lending pool share as collateral to the position
    /// @param _posId position id
    /// @param _pool lending pool address
    /// @return amtIn pool's share collateral amount added to the position
    function addCollateral(uint _posId, address _pool) external returns (uint amtIn);

    /// @notice only core can call this function
    /// @dev add wrapped lp share as collateral to the position
    /// @param _posId position id
    /// @param _wLp wlp address
    /// @param _tokenId wlp token id
    /// @return amtIn wlp collateral amount added to the position
    function addCollateralWLp(uint _posId, address _wLp, uint _tokenId) external returns (uint amtIn);

    /// @notice only core can call this function
    /// @dev remove lending pool share from the position
    /// @param _posId position id
    /// @param _pool lending pool address
    /// @param _receiver address to receive the shares
    /// @return amtOut pool's share collateral amount removed from the position
    function removeCollateralTo(uint _posId, address _pool, uint _shares, address _receiver)
        external
        returns (uint amtOut);

    /// @notice only core can call this function
    /// @dev remove wlp from the position
    /// @param _posId position id
    /// @param _wLp wlp address
    /// @param _tokenId wlp token id
    /// @param _amt wlp token amount to remove
    /// @return amtOut wlp collateral amount removed from the position
    function removeCollateralWLpTo(uint _posId, address _wLp, uint _tokenId, uint _amt, address _receiver)
        external
        returns (uint amtOut);

    /// @notice only core can call this function
    /// @dev create a new position
    /// @param _owner position owner
    /// @param _mode position mode
    /// @param _viewer position viewer
    /// @return posId position id
    function createPos(address _owner, uint16 _mode, address _viewer) external returns (uint posId);

    /// @dev harvest rewards from the wlp token
    /// @param _posId position id
    /// @param _wlp wlp address
    /// @param _tokenId id of the wlp token
    /// @param _to address to receive the rewards
    /// @return tokens token address list harvested
    ///         amts token amt list harvested
    function harvestTo(uint _posId, address _wlp, uint _tokenId, address _to)
        external
        returns (address[] memory tokens, uint[] memory amts);

    /// @notice When removing the wrapped LP collateral, the rewards are harvested to the position manager
    ///         before unwrapping the LP and sending it to the user
    /// @dev claim pending reward pending in the position manager
    /// @param _posId position id
    /// @param _tokens token address list to claim pending reward
    /// @param _to address to receive the pending rewards
    /// @return amts amount of each reward tokens claimed
    function claimPendingRewards(uint _posId, address[] calldata _tokens, address _to)
        external
        returns (uint[] memory amts);

    /// @notice authorized account could be the owner or approved addresses
    /// @dev check if the accoount is authorized for the position
    /// @param _account account address to check
    /// @param _posId position id
    /// @return whether the account is authorized to manage the position
    function isAuthorized(address _account, uint _posId) external view returns (bool);

    /// @notice only guardian can call this function
    /// @dev set the max number of the different collateral count (to avoid out-of-gas error)
    /// @param _maxCollCount new max collateral count
    function setMaxCollCount(uint8 _maxCollCount) external;

    /// @notice only position owner can call this function
    /// @dev set new position viewer for pos id
    /// @param _posId pos id
    /// @param _viewer new viewer address
    function setPosViewer(uint _posId, address _viewer) external;
}

// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface ILBTokenHolder {
    event SetClaimer(address newClaimer);

    /// @dev get the reward claimer address
    /// @return claimer reward claimable address
    function claimer() external returns (address claimer);

    /// @dev get the moe lp address
    /// @return moeLp moe lp address
    function moeLp() external returns (address moeLp);

    /// @dev get the wrapped lp moe v2 address
    /// @return wlpMoeV2 wrapped moe v2 address
    function wlpMoeV2() external returns (address wlpMoeV2);

    /// @notice rewarder need to be whitelisted in WLpMoeV2 contract
    /// @dev claim the reward with the specific rewarder in case of the rewarder has been changed
    /// @param _hooksRewarder moe's hooks rewarder address
    /// @param _ids list of binId
    /// @param _to receiver
    function batchClaimRewardTo(address _hooksRewarder, uint[] memory _ids, address _to) external;

    /// @dev transfer amount of each LBToken bins to the _to address
    /// @param _to receiver
    /// @param _ids list of binId
    /// @param _amts list of binIdAmts coresponding to _ids
    function batchTransferLBTokenTo(address _to, uint[] calldata _ids, uint[] calldata _amts) external;

    /// @notice rewarder need to be whitelisted in WLpMoeV2 contract
    /// @dev get the sum of pending rewards for bin ids
    /// @param _hooksRewarder moe's hooks rewarder address
    /// @param _ids list of binId
    function getPendingRewards(address _hooksRewarder, uint[] calldata _ids)
        external
        view
        returns (address[] memory rewardTokens, uint[] memory pendingAmts);

    /// @dev set new reward claimer
    /// @param _claimer new reward claimer
    function setClaimer(address _claimer) external;
}

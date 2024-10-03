// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface IMoneyMarketHook {
    event SetWhitelistedHelpers(address[] _helpers, bool status);

    // struct
    struct RebaseHelperParams {
        address helper; // wrap helper address if address(0) then not wrap
        address tokenIn; // token to use in rebase helper
    }

    // NOTE: there is 3 types of deposit
    // 1. deposit native token use msg.value for native token
    // if amt > 0 mean user want to use wNative too
    // 2. wrap rebase token to non-rebase token and deposit (using rebase helper)
    // 3. deposit normal erc20 token
    struct DepositParams {
        address pool; // lending pool to deposit
        uint amt; // token amount to deposit
        RebaseHelperParams rebaseHelperParams; // wrap params
    }

    struct WithdrawParams {
        address pool; // lending pool to withdraw
        uint shares; // shares to withdraw
        RebaseHelperParams rebaseHelperParams; // wrap params
        address to; // receiver to receive withdraw tokens
    }

    struct RepayParams {
        address pool; // lending pool to repay
        uint shares; // shares to repay
    }

    struct BorrowParams {
        address pool; // lending pool to borrow
        uint amt; // token amount to borrow
        address to; // receiver to receive borrow tokens
    }

    struct OperationParams {
        uint posId; //  position id to execute (0 to create new position)
        address viewer; // address to view position
        uint16 mode; // position mode to be used
        DepositParams[] depositParams; // deposit parameters
        WithdrawParams[] withdrawParams; // withdraw parameters
        BorrowParams[] borrowParams; // borrow parameters
        RepayParams[] repayParams; // repay parameters
        uint minHealth_e18; // minimum health to maintain after execute
        bool returnNative; // return native token or not (using balanceOf(address(this)))
    }

    // function
    /// @dev get the core address
    function CORE() external view returns (address);

    /// @dev get the position manager address
    function POS_MANAGER() external view returns (address);

    /// @dev get the wNative address
    function WNATIVE() external view returns (address);

    /// @dev get last user's position id
    /// @param _user user address
    /// @return posId last user's position id
    function lastPosIds(address _user) external view returns (uint posId);

    /// @dev get the init position id (nft id)
    /// @param _user user address
    /// @param _posId position id
    /// @return initPosId init position id (nft id)
    function initPosIds(address _user, uint _posId) external view returns (uint initPosId);

    /// @dev check if the helper is whitelisted.
    /// @param _helper helper address
    /// @return whether the helper is whitelisted.
    function whitelistedHelpers(address _helper) external view returns (bool);

    /// @dev execute all position actions in one transaction via multicall (to avoid multiple health check)
    /// @param _params operation parameters
    /// @return posId hook position id
    /// @return initPosId init position id (nft id)
    /// @return results results of multicall
    function execute(OperationParams calldata _params)
        external
        payable
        returns (uint posId, uint initPosId, bytes[] memory results);

    /// @dev create new position
    /// @param _mode position mode to be used
    /// @param _viewer address to view position
    /// @return posId hook position id
    /// @return initPosId init position id (nft id)
    function createPos(uint16 _mode, address _viewer) external returns (uint posId, uint initPosId);

    /// @notice only guardian role can call
    /// @dev set whitelisted helper statuses
    /// @param _helpers helper list
    /// @param _status whitelisted status to set to
    function setWhitelistedHelpers(address[] calldata _helpers, bool _status) external;
}

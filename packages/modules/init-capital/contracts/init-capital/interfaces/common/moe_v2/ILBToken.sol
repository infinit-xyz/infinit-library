// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

/**
 * @title Liquidity Book Token Interface
 * @author Trader Joe
 * @notice Interface to interact with the LBToken.
 */
interface ILBToken {
    error LBToken__AddressThisOrZero();
    error LBToken__InvalidLength();
    error LBToken__SelfApproval(address owner);
    error LBToken__SpenderNotApproved(address from, address spender);
    error LBToken__TransferExceedsBalance(address from, uint id, uint amount);
    error LBToken__BurnExceedsBalance(address from, uint id, uint amount);

    event TransferBatch(address indexed sender, address indexed from, address indexed to, uint[] ids, uint[] amounts);

    event ApprovalForAll(address indexed account, address indexed sender, bool approved);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function totalSupply(uint id) external view returns (uint);

    function balanceOf(address account, uint id) external view returns (uint);

    function balanceOfBatch(address[] calldata accounts, uint[] calldata ids) external view returns (uint[] memory);

    function isApprovedForAll(address owner, address spender) external view returns (bool);

    function approveForAll(address spender, bool approved) external;

    function batchTransferFrom(address from, address to, uint[] calldata ids, uint[] calldata amounts) external;

    function getBin(uint24 id) external view returns (uint128 binReserveX, uint128 binReserveY);

    function getPriceFromId(uint24 id) external view returns (uint price);

    function getIdFromPrice(uint price) external view returns (uint24 id);
}

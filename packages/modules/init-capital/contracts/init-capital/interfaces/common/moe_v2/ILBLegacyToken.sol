// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import '@openzeppelin-contracts/utils/introspection/IERC165.sol';

/// @title Liquidity Book V2 Token Interface
/// @author Trader Joe
/// @notice Required interface of LBToken contract
interface ILBLegacyToken is IERC165 {
    event TransferSingle(address indexed sender, address indexed from, address indexed to, uint id, uint amount);

    event TransferBatch(address indexed sender, address indexed from, address indexed to, uint[] ids, uint[] amounts);

    event ApprovalForAll(address indexed account, address indexed sender, bool approved);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function balanceOf(address account, uint id) external view returns (uint);

    function balanceOfBatch(address[] calldata accounts, uint[] calldata ids)
        external
        view
        returns (uint[] memory batchBalances);

    function totalSupply(uint id) external view returns (uint);

    function isApprovedForAll(address owner, address spender) external view returns (bool);

    function setApprovalForAll(address sender, bool approved) external;

    function safeTransferFrom(address from, address to, uint id, uint amount) external;

    function safeBatchTransferFrom(address from, address to, uint[] calldata id, uint[] calldata amount) external;
}

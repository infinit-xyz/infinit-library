// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IERC721Upgradeable} from '@openzeppelin-contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';

/// @title Base Wrapped Lp Interface
interface IBaseWrapLpUpgradeable is IERC721Upgradeable {
    /// @dev unwrap the wrapped token to get the lp token (burn token if unwrapping all)
    /// @param _id wlp token id
    /// @param _amt amount of the wrapped token to unwrap
    /// @param _to address to receive the lp token
    function unwrap(uint _id, uint _amt, address _to) external returns (bytes memory);

    /// @dev harvest rewards from the wlp
    /// @param _id id of the wlp token
    /// @param _to address to receive the rewards
    function harvest(uint _id, address _to) external returns (address[] memory tokens, uint[] memory amounts);

    /// @dev get the amount of lp token with for a specific token id (using internal balance)
    /// @param _id wlp token id
    /// @return amt amount of lp underliyng the specific token id
    function balanceOfLp(uint _id) external view returns (uint amt);

    /// @dev get lp token address
    /// @param _id id of the wlp
    /// @return lp lp address
    function lp(uint _id) external view returns (address lp);

    /// @dev get underlying tokens of the wlp
    /// @param _id wlp token id
    /// @return tokens list of underlying tokens
    function underlyingTokens(uint _id) external view returns (address[] memory tokens);

    /// @dev get reward token addresses of the wlp
    /// @param _id wlp token id
    /// @return tokens reward token list (may be empty)
    function rewardTokens(uint _id) external view returns (address[] memory tokens);

    /// @dev get lp price of the wlp
    /// @param _id wlp token id
    /// @param _oracle oracle address
    /// @return price lp price
    function calculatePrice_e36(uint _id, address _oracle) external view returns (uint price);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Pyth Interface
interface IPyth {
    /// @dev get the token price from the price id
    /// @param priceId price id corelated to the token
    /// @return price the current price of the data feed id
    ///         conf confidence interval around the price
    ///         exponent price exponents
    ///         lastUpdate last update timestamp
    function getPriceUnsafe(bytes32 priceId)
        external
        view
        returns (int64 price, uint64 conf, int32 exponent, uint64 lastUpdate);
}

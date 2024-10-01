pragma solidity ^0.8.10;

interface IApi3Proxy {
    function read() external view returns (int224, uint256);
}

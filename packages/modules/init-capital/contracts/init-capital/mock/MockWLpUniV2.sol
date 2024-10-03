// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IWrapLpERC20} from '../interfaces/wrapper/IWrapLpERC20.sol';
import {IInitOracle} from '../interfaces/oracle/IInitOracle.sol';
import {ERC721} from '@openzeppelin-contracts/token/ERC721/ERC721.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';

interface IUniswapV2Pair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves() external view returns (uint112 r0, uint112 r1, uint32 time);

    function burn(address _to) external returns (uint amt0, uint amt1);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract MockWLpUniV2 is IWrapLpERC20, ERC721 {
    using SafeERC20 for IERC20;
    using Math for uint;

    mapping(uint => address) public lps;
    uint96 public nextId;
    mapping(uint => uint) public balanceOfLp;
    address public immutable UNI_V2_FACTORY;
    mapping(uint => mapping(address => uint)) public pendingRewards; // use for testing only

    constructor(address _uniV2Factory) ERC721('wrapLpUniV2', 'wlpUniV2') {
        UNI_V2_FACTORY = _uniV2Factory;
        nextId = 1;
    }

    modifier onlyOwner(uint _id) {
        require(msg.sender == _ownerOf(_id), 'only owner');
        _;
    }

    function wrap(address _lp, uint _amt, address _to, bytes calldata) external returns (uint id) {
        // validate _lp is a uniswap v2 pair
        address token0 = IUniswapV2Pair(_lp).token0();
        address token1 = IUniswapV2Pair(_lp).token1();
        require(IUniswapV2Factory(UNI_V2_FACTORY).getPair(token0, token1) == _lp, 'not a uniswap v2 pair');
        IERC20(_lp).safeTransferFrom(msg.sender, address(this), _amt);
        id = nextId++;
        lps[id] = _lp;
        balanceOfLp[id] = _amt;
        _mint(_to, id);
    }

    function unwrap(uint _id, uint _amt, address _to) external onlyOwner(_id) returns (bytes memory) {
        uint newBalance = balanceOfLp[_id] - _amt;
        balanceOfLp[_id] = newBalance;
        IERC20(lps[_id]).safeTransfer(_to, _amt);
    }

    function addRewards(uint _id, uint[] calldata _amts) external {
        address[] memory tokens = rewardTokens(_id);
        for (uint i; i < tokens.length; i++) {
            IERC20(tokens[i]).safeTransferFrom(msg.sender, address(this), _amts[i]);
            pendingRewards[_id][tokens[i]] += _amts[i];
        }
    }

    function harvest(uint _id, address _to)
        external
        onlyOwner(_id)
        returns (address[] memory tokens, uint[] memory amts)
    {
        tokens = rewardTokens(_id);
        amts = new uint[](tokens.length);
        for (uint i; i < tokens.length; i++) {
            amts[i] = pendingRewards[_id][tokens[i]];
            pendingRewards[_id][tokens[i]] = 0;
            IERC20(tokens[i]).safeTransfer(_to, amts[i]);
        }
    }

    function rewardTokens(uint _id) public view returns (address[] memory tokens) {
        tokens = new address[](2);
        address pair = lps[_id];
        (tokens[0], tokens[1]) = (IUniswapV2Pair(pair).token0(), IUniswapV2Pair(pair).token1());
    }

    function lp(uint _id) external view returns (address) {
        return lps[_id];
    }

    function underlyingTokens(uint _id) external view returns (address[] memory tokens) {
        tokens = new address[](2);
        address pair = lps[_id];
        (tokens[0], tokens[1]) = (IUniswapV2Pair(pair).token0(), IUniswapV2Pair(pair).token1());
    }

    function calculatePrice_e36(uint _id, address _oracle) external view returns (uint price) {
        address pair = lps[_id];
        address[] memory tokens = new address[](2);
        (tokens[0], tokens[1]) = (IUniswapV2Pair(pair).token0(), IUniswapV2Pair(pair).token1());
        (uint r0, uint r1,) = IUniswapV2Pair(pair).getReserves();
        uint sqrtK = (r0 * r1).sqrt().mulDiv(1e36, IERC20(pair).totalSupply());
        uint[] memory prices_e36 = IInitOracle(_oracle).getPrices_e36(tokens);
        price = (sqrtK * 2 * prices_e36[0].sqrt()).mulDiv(prices_e36[1].sqrt(), 1e36);
    }
}

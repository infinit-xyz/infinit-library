// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';

import {UnderACM} from '../common/UnderACM.sol';

import {IWLpMoeMasterChef} from '../interfaces/wrapper/IWLpMoeMasterChef.sol';
import {IMasterChefRewarder} from '../interfaces/common/moe/IMasterChefRewarder.sol';
import {IMasterChef} from '../interfaces/common/moe/IMasterChef.sol';
import {IMoePair} from '../interfaces/common/moe/IMoePair.sol';
import {IMoeFactory} from '../interfaces/common/moe/IMoeFactory.sol';
import {IInitOracle} from '../interfaces/oracle/IInitOracle.sol';
import {IWNative} from '../interfaces/common/IWNative.sol';

import {ERC721} from '@openzeppelin-contracts/token/ERC721/ERC721.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';
import {EnumerableSet} from '@openzeppelin-contracts/utils/structs/EnumerableSet.sol';
import {ERC721Upgradeable} from '@openzeppelin-contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';

contract WLpMoeMasterChef is IWLpMoeMasterChef, ERC721Upgradeable, UnderACM {
    using Math for uint;
    using UncheckedIncrement for uint;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    // constants
    uint private constant ONE_E18 = 1e18;
    uint private constant ONE_E36 = 1e36;
    bytes32 private constant GUARDIAN = keccak256('guardian');

    // immutables
    address public immutable MASTER_CHEF;
    address public immutable MOE;
    address public immutable MOE_FACTORY;
    address public immutable WNATIVE;

    // storages
    // id
    uint public lastId; // last wLp id
    // id => lp token address
    mapping(uint => address) public lps; // lp token address for each wLp id
    // id => lp balances
    mapping(uint => uint) private __lpBalances; // amount of lp token for each wLp id
    // id => pid
    mapping(uint => uint) public pids; // masterchef pool id for each wLp id
    // id => tokens
    mapping(uint => EnumerableSet.AddressSet) private __rewardTokens; // reward tokens for each wLp id
    // id => token => acc reward per share for id
    mapping(uint => mapping(address => uint)) public idAccRewardPerShares_e18; // acc reward per share for each token in each wLp id
    // pid => token => acc reward per share for pid
    mapping(uint => mapping(address => uint)) public pidAccRewardPerShares_e18; // acc reward per share for each reward token in masterchef pid

    // modifiers
    modifier onlyOwner(uint _id) {
        _require(msg.sender == _ownerOf(_id), Errors.NOT_OWNER);
        _;
    }

    modifier onlyGuardian() {
        ACM.checkRole(GUARDIAN, msg.sender);
        _;
    }

    // reward update
    modifier updateRewards(uint _pid) {
        // add MOE to __rewardTokens set
        __rewardTokens[_pid].add(MOE);
        // add extraReward to __rewardTokens set if there is extraRewarder
        (address extraRewarder, address extraRewardToken) = _getExtraRewarderAndToken(_pid);
        if (extraRewarder != address(0)) __rewardTokens[_pid].add(extraRewardToken);

        uint lpSupply = IMasterChef(MASTER_CHEF).getDeposit(_pid, address(this));
        address[] memory ___rewardTokens = __rewardTokens[_pid].values();
        uint[] memory _pidAccRewardPerShares_e18 = new uint[](___rewardTokens.length);
        uint[] memory rewardBeforeAmts = new uint[](___rewardTokens.length);
        for (uint i; i < ___rewardTokens.length; i = i.uinc()) {
            address rewardToken = ___rewardTokens[i];

            _pidAccRewardPerShares_e18[i] = pidAccRewardPerShares_e18[_pid][rewardToken];
            rewardBeforeAmts[i] = IERC20(rewardToken).balanceOf(address(this));
        }
        _;
        for (uint i; i < ___rewardTokens.length; i = i.uinc()) {
            address rewardToken = ___rewardTokens[i];
            if (lpSupply != 0) {
                _pidAccRewardPerShares_e18[i] +=
                    ((IERC20(rewardToken).balanceOf(address(this)) - rewardBeforeAmts[i]) * ONE_E18) / lpSupply;
            }

            // update global
            pidAccRewardPerShares_e18[_pid][rewardToken] = _pidAccRewardPerShares_e18[i];
        }
    }

    // constructor
    constructor(address _chef, address _factory, address _wNative, address _acm) UnderACM(_acm) {
        _disableInitializers();
        MASTER_CHEF = _chef;
        MOE_FACTORY = _factory;
        WNATIVE = _wNative;
        MOE = address(IMasterChef(_chef).getMoe());
    }

    // initializer
    /// @dev initialize the contract, set the ERC721's name and symbol
    /// @param _name ERC721's name
    /// @param _symbol ERC721's symbol
    function initialize(string calldata _name, string calldata _symbol) external initializer {
        __ERC721_init(_name, _symbol);
    }

    // functions
    // @inheritdoc IWrapLpERC20Upgradeable
    function rewardTokens(uint _id) external view returns (address[] memory tokens) {
        tokens = __rewardTokens[pids[_id]].values();
    }

    // @inheritdoc IWrapLpERC20Upgradeable
    function wrap(address _lp, uint _amt, address _to, bytes calldata _extraData) external returns (uint id) {
        // validate _lp is a moe pair
        uint pid = abi.decode(_extraData, (uint));
        _require(address(IMasterChef(MASTER_CHEF).getToken(pid)) == _lp, Errors.INCORRECT_PAIR);

        // receive lp and records
        IERC20(_lp).safeTransferFrom(msg.sender, address(this), _amt);
        id = ++lastId;
        lps[id] = _lp;
        pids[id] = pid;
        __lpBalances[id] = _amt;

        // approve lp to masterchef
        IERC20(_lp).safeApprove(MASTER_CHEF, _amt);

        // deposit to masterchef
        _depositToMasterChef(pid, _amt);

        // update idAccRewardPerShares_e18
        address[] memory ___rewardTokens = __rewardTokens[pid].values();
        for (uint i; i < ___rewardTokens.length; i = i.uinc()) {
            address rewardToken = ___rewardTokens[i];
            idAccRewardPerShares_e18[id][rewardToken] = pidAccRewardPerShares_e18[pid][rewardToken];
        }

        // mint
        _mint(_to, id);
    }

    // @inheritdoc IWrapLpERC20Upgradeable
    // @return amtOut amount of lp token out
    function unwrap(uint _id, uint _amt, address _to) external onlyOwner(_id) returns (bytes memory amtOut) {
        // get user's balance
        uint lpBalance = __lpBalances[_id];

        // update records
        __lpBalances[_id] = lpBalance - _amt;

        // withdraw from masterchef
        _withdrawFromMasterChef(pids[_id], _amt);

        // transfer lp back
        IERC20(lps[_id]).safeTransfer(_to, _amt);

        // transfer reward tokens
        _transferRewards(_id, lpBalance, _to);

        amtOut = abi.encode(_amt);
    }

    // @inheritdoc IWrapLpERC20Upgradeable
    function harvest(uint _id, address _to)
        external
        onlyOwner(_id)
        returns (address[] memory tokens, uint[] memory amts)
    {
        // claim rewardToken from masterchef
        _claimFromMasterChef(pids[_id]);

        // transfer reward tokens
        (tokens, amts) = _transferRewards(_id, __lpBalances[_id], _to);
    }

    // @inheritdoc IWrapLpERC20Upgradeable
    function lp(uint _id) external view returns (address) {
        return lps[_id];
    }

    // @inheritdoc IWrapLpERC20Upgradeable
    function balanceOfLp(uint _id) external view returns (uint) {
        return __lpBalances[_id];
    }

    // @inheritdoc IWrapLpERC20Upgradeable
    function underlyingTokens(uint _id) external view returns (address[] memory tokens) {
        tokens = new address[](2);
        address _lp = lps[_id];
        (tokens[0], tokens[1]) = (IMoePair(_lp).token0(), IMoePair(_lp).token1());
    }

    // @inheritdoc IWrapLpERC20Upgradeable
    function calculatePrice_e36(uint _id, address _oracle) external view returns (uint price) {
        address _lp = lps[_id];

        address[] memory tokens = new address[](2);
        (tokens[0], tokens[1]) = (IMoePair(_lp).token0(), IMoePair(_lp).token1());
        (uint r0, uint r1,) = IMoePair(_lp).getReserves();
        uint[] memory prices_e36 = IInitOracle(_oracle).getPrices_e36(tokens);

        uint kLast = IMoePair(_lp).kLast();
        uint totalSupply = IMoePair(_lp).totalSupply();

        if (kLast == 0) {
            // price = 2 * sqrt(r0 * p0) * sqrt(r1 * p1) / totalSupply
            price = 2 * (r0 * prices_e36[0]).sqrt() * (r1 * prices_e36[1]).sqrt() / totalSupply;
        } else {
            // price = 2 * sqrt(klast * (p0 * p1 / totalSupply) / totalSupply)
            price = 2 * (kLast.mulDiv(prices_e36[0].mulDiv(prices_e36[1], totalSupply), totalSupply)).sqrt();
        }
    }

    /// @dev get wLp pending reward tokens
    /// @param _id wLp id
    /// @return tokens pending rewardToken tokens
    /// @return amts amount of pending rewardToken tokens
    function getPendingRewards(uint _id) external view returns (address[] memory tokens, uint[] memory amts) {
        // get pending rewards from masterchef
        uint pid = pids[_id];
        uint[] memory _pids = new uint[](1);
        _pids[0] = pid;
        (uint[] memory moeRewards,, uint[] memory extraRewards) =
            IMasterChef(MASTER_CHEF).getPendingRewards(address(this), _pids);
        (address extraRewarder, address extraToken) = _getExtraRewarderAndToken(pid);

        // update reward tokens (note: this does not modify state)
        {
            uint numToken = __rewardTokens[pid].length();
            if (extraRewarder != address(0) && !__rewardTokens[pid].contains(extraToken)) {
                tokens = new address[](numToken + 1);
                for (uint i; i < numToken; i = i.uinc()) {
                    tokens[i] = __rewardTokens[pid].at(i);
                }
                tokens[numToken] = extraToken;
            } else {
                // extraRewarder == address(0) or extraToken is alr in __rewardTokens[pid]
                tokens = new address[](numToken);
                tokens = __rewardTokens[pid].values();
            }
        }

        uint lpSupply = IMasterChef(MASTER_CHEF).getDeposit(pid, address(this));
        //  currentAccRewardPerShares_e18
        uint[] memory currentAccRewardPerShares_e18 = new uint[](tokens.length);
        for (uint i; i < tokens.length; i = i.uinc()) {
            if (tokens[i] == MOE) {
                currentAccRewardPerShares_e18[i] =
                    pidAccRewardPerShares_e18[pid][MOE] + moeRewards[0] * ONE_E18 / lpSupply;
            } else if (tokens[i] == extraToken) {
                currentAccRewardPerShares_e18[i] =
                    pidAccRewardPerShares_e18[pid][extraToken] + extraRewards[0] * ONE_E18 / lpSupply;
            } else {
                currentAccRewardPerShares_e18[i] = pidAccRewardPerShares_e18[pid][tokens[i]];
            }
        }

        amts = new uint[](tokens.length);

        // calculate pending __rewardTokens
        for (uint i; i < tokens.length; i = i.uinc()) {
            amts[i] = (currentAccRewardPerShares_e18[i] - idAccRewardPerShares_e18[_id][tokens[i]]) * __lpBalances[_id]
                / ONE_E18;
        }
    }

    /// @dev get lp extra rewardToken token address
    /// @param _pid Moe masterchef pool's id
    /// @return extraRewarder address of the extraRewarder
    /// @return extraToken address of the extraReward Token
    function _getExtraRewarderAndToken(uint _pid) internal view returns (address extraRewarder, address extraToken) {
        // check if extra rewarder of farm is set before call
        extraRewarder = address(IMasterChef(MASTER_CHEF).getExtraRewarder(_pid));
        if (address(extraRewarder) != address(0)) {
            // check if the extra reward is a native token
            extraToken = address(IMasterChefRewarder(extraRewarder).getToken());
            if (extraToken == address(0)) extraToken = WNATIVE;
        }
    }

    /// @dev update rewards and deposit to masterchef
    /// @param _pid Moe masterchef pool's id
    function _depositToMasterChef(uint _pid, uint _amt) internal updateRewards(_pid) {
        IMasterChef(MASTER_CHEF).deposit(_pid, _amt);
    }

    /// @dev update rewards and withdraw from masterchef
    /// @param _pid Moe masterchef pool's id
    function _withdrawFromMasterChef(uint _pid, uint _amt) internal updateRewards(_pid) {
        IMasterChef(MASTER_CHEF).withdraw(_pid, _amt);
    }

    /// @dev update rewardToken and claim reward tokens from masterchef
    /// @param _pid Moe masterchef pool's id
    function _claimFromMasterChef(uint _pid) internal updateRewards(_pid) {
        uint[] memory _pids = new uint[](1);
        _pids[0] = _pid;

        // claim reward tokens from masterchef
        IMasterChef(MASTER_CHEF).claim(_pids);
    }

    /// @notice claim all reward tokens and update idAccRewardPerShares_e18 to the current pidAccRewardPerShares_e18
    /// @dev update rewardToken and claim reward tokens from masterchef
    /// @param _id wLp's id to transfer reward tokens
    /// @param _amt share amount to transfer reward tokens
    /// @param _to address to transfer reward tokens to
    function _transferRewards(uint _id, uint _amt, address _to)
        internal
        returns (address[] memory tokens, uint[] memory amts)
    {
        uint pid = pids[_id];
        tokens = __rewardTokens[pid].values();
        amts = new uint[](tokens.length);

        for (uint i; i < tokens.length; i = i.uinc()) {
            address rewardToken = tokens[i];
            uint amt = (pidAccRewardPerShares_e18[pid][rewardToken] - idAccRewardPerShares_e18[_id][rewardToken]) * _amt
                / ONE_E18;
            amts[i] = amt;
            // update idAccRewardPerShares_e18
            idAccRewardPerShares_e18[_id][rewardToken] = pidAccRewardPerShares_e18[pid][rewardToken];

            if (amt > 0) IERC20(rewardToken).safeTransfer(_to, amt);
        }
    }

    /// @notice user remove reward tokens with caution
    /// @dev guardian remove reward token from pid to avoid out of gas
    /// @param _pid Moe masterchef pool's id
    /// @param _token address of the reward token to remove
    function removeRewardTokens(uint _pid, address _token) external onlyGuardian {
        if (__rewardTokens[_pid].remove(_token)) emit RemoveReward(_pid, _token);
    }

    receive() external payable {
        // wrap native token to wrap native on receive
        IWNative(WNATIVE).deposit{value: msg.value}();
    }
}

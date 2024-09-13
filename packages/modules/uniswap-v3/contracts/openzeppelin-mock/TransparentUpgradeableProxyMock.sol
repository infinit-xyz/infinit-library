import "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";

// note: mock contract to be able to compile ProxyAdmin.sol from node_modules
contract TrasnparentUpgradeableProxyMock is TransparentUpgradeableProxy {
    constructor(address _logic, address _admin, bytes memory _data)
        TransparentUpgradeableProxy(_logic, _admin, _data)
    {}
}

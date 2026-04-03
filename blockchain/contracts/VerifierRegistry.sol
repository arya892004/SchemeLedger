// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VerifierRegistry is Ownable {
    
    struct Verifier {
        string name;
        bool isActive;
        uint256 totalVerifications;
        uint256 flaggedCount;
    }

    mapping(address => Verifier) public verifiers;
    mapping(address => bool) public authorities;
    
    event VerifierAdded(address indexed verifier, string name);
    event VerifierFlagged(address indexed verifier, uint256 flagCount);
    event AuthorityAdded(address indexed authority);

    constructor() Ownable(msg.sender) {
        authorities[msg.sender] = true;
    }

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Not an authority");
        _;
    }

    function addAuthority(address _authority) external onlyOwner {
        authorities[_authority] = true;
        emit AuthorityAdded(_authority);
    }

    function addVerifier(address _verifier, string memory _name) 
        external onlyAuthority {
        verifiers[_verifier] = Verifier(_name, true, 0, 0);
        emit VerifierAdded(_verifier, _name);
    }

    function isVerifier(address _addr) external view returns (bool) {
        return verifiers[_addr].isActive;
    }

    function isAuthority(address _addr) external view returns (bool) {
        return authorities[_addr];
    }

    function incrementVerification(address _verifier) external {
        verifiers[_verifier].totalVerifications++;
    }

    function flagVerifier(address _verifier) external onlyAuthority {
        verifiers[_verifier].flaggedCount++;
        if (verifiers[_verifier].flaggedCount >= 3) {
            verifiers[_verifier].isActive = false;
        }
        emit VerifierFlagged(_verifier, verifiers[_verifier].flaggedCount);
    }
}
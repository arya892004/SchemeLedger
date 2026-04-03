// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VerifierRegistry.sol";

contract SchemeRegistry {

    VerifierRegistry public verifierRegistry;

    struct Scheme {
        bytes32 schemeId;
        string name;
        string description;
        string ipfsMetadata;      // eligibility rules stored on IPFS
        uint256 totalBudget;
        uint256 disbursed;
        uint256 maxBeneficiaries;
        uint256 currentBeneficiaries;
        address authority;
        bool active;
        uint256 createdAt;
    }

    mapping(bytes32 => Scheme) public schemes;
    bytes32[] public schemeIds;

    event SchemePublished(bytes32 indexed schemeId, string name, address authority);
    event SchemeUpdated(bytes32 indexed schemeId);
    event BudgetAllocated(bytes32 indexed schemeId, uint256 amount);

    constructor(address _verifierRegistry) {
        verifierRegistry = VerifierRegistry(_verifierRegistry);
    }

    modifier onlyAuthority() {
        require(verifierRegistry.isAuthority(msg.sender), "Not an authority");
        _;
    }

    function publishScheme(
        string memory _name,
        string memory _description,
        string memory _ipfsMetadata,
        uint256 _totalBudget,
        uint256 _maxBeneficiaries
    ) external onlyAuthority returns (bytes32) {
        
        bytes32 schemeId = keccak256(
            abi.encodePacked(_name, msg.sender, block.timestamp)
        );

        schemes[schemeId] = Scheme({
            schemeId: schemeId,
            name: _name,
            description: _description,
            ipfsMetadata: _ipfsMetadata,
            totalBudget: _totalBudget,
            disbursed: 0,
            maxBeneficiaries: _maxBeneficiaries,
            currentBeneficiaries: 0,
            authority: msg.sender,
            active: true,
            createdAt: block.timestamp
        });

        schemeIds.push(schemeId);
        emit SchemePublished(schemeId, _name, msg.sender);
        return schemeId;
    }

    function getScheme(bytes32 _schemeId) 
        external view returns (Scheme memory) {
        return schemes[_schemeId];
    }

    function getAllSchemeIds() external view returns (bytes32[] memory) {
        return schemeIds;
    }

    function isSchemeActive(bytes32 _schemeId) external view returns (bool) {
        return schemes[_schemeId].active;
    }

    function incrementBeneficiary(bytes32 _schemeId, uint256 _amount) external {
        schemes[_schemeId].currentBeneficiaries++;
        schemes[_schemeId].disbursed += _amount;
    }
}
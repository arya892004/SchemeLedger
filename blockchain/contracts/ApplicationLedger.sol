// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VerifierRegistry.sol";
import "./SchemeRegistry.sol";

contract ApplicationLedger {

    VerifierRegistry public verifierRegistry;
    SchemeRegistry public schemeRegistry;

    enum Status { Submitted, Verified, Approved, Disbursed, Rejected }

    struct Application {
        bytes32 appId;
        address applicant;
        bytes32 schemeId;
        bytes32 credentialHash;   // hash of off-chain documents
        bytes32 nullifierHash;    // anti-duplicate: hash(aadhaar+schemeId+salt)
        Status status;
        address verifier;
        uint256 submittedAt;
        uint256 lastUpdated;
        uint256 amountDisbursed;
        string rejectionReason;
    }

    mapping(bytes32 => Application) public applications;
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(address => bytes32[]) public applicantApplications;
    bytes32[] public allApplicationIds;

    event ApplicationSubmitted(
        bytes32 indexed appId,
        address indexed applicant,
        bytes32 indexed schemeId,
        uint256 timestamp
    );
    event ApplicationVerified(bytes32 indexed appId, address indexed verifier);
    event ApplicationApproved(bytes32 indexed appId);
    event FundsDisbursed(
        bytes32 indexed appId,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );
    event ApplicationRejected(bytes32 indexed appId, string reason);

    constructor(address _verifierRegistry, address _schemeRegistry) {
        verifierRegistry = VerifierRegistry(_verifierRegistry);
        schemeRegistry = SchemeRegistry(_schemeRegistry);
    }

    modifier onlyVerifier() {
        require(verifierRegistry.isVerifier(msg.sender), "Not a verifier");
        _;
    }

    modifier onlyAuthority() {
        require(verifierRegistry.isAuthority(msg.sender), "Not an authority");
        _;
    }

    // STEP 1: Citizen submits application
    function submitApplication(
        bytes32 _schemeId,
        bytes32 _credentialHash,
        bytes32 _nullifierHash
    ) external returns (bytes32) {

        require(schemeRegistry.isSchemeActive(_schemeId), "Scheme not active");
        require(!usedNullifiers[_nullifierHash], "Already applied for this scheme");

        bytes32 appId = keccak256(
            abi.encodePacked(msg.sender, _schemeId, block.timestamp, _nullifierHash)
        );

        usedNullifiers[_nullifierHash] = true;

        applications[appId] = Application({
            appId: appId,
            applicant: msg.sender,
            schemeId: _schemeId,
            credentialHash: _credentialHash,
            nullifierHash: _nullifierHash,
            status: Status.Submitted,
            verifier: address(0),
            submittedAt: block.timestamp,
            lastUpdated: block.timestamp,
            amountDisbursed: 0,
            rejectionReason: ""
        });

        applicantApplications[msg.sender].push(appId);
        allApplicationIds.push(appId);

        emit ApplicationSubmitted(appId, msg.sender, _schemeId, block.timestamp);
        return appId;
    }

    // STEP 2: Verifier reviews documents off-chain, records on-chain
    function verifyApplication(bytes32 _appId) external onlyVerifier {
        Application storage app = applications[_appId];
        require(app.status == Status.Submitted, "Invalid status");

        app.status = Status.Verified;
        app.verifier = msg.sender;
        app.lastUpdated = block.timestamp;

        verifierRegistry.incrementVerification(msg.sender);
        emit ApplicationVerified(_appId, msg.sender);
    }

    // STEP 3: Authority approves and disburses
    function approveAndDisburse(bytes32 _appId, uint256 _amount) 
        external onlyAuthority {
        Application storage app = applications[_appId];
        require(app.status == Status.Verified, "Must be verified first");

        app.status = Status.Disbursed;
        app.amountDisbursed = _amount;
        app.lastUpdated = block.timestamp;

        schemeRegistry.incrementBeneficiary(app.schemeId, _amount);

        emit ApplicationApproved(_appId);
        emit FundsDisbursed(_appId, app.applicant, _amount, block.timestamp);
    }

    // Reject at any stage
    function rejectApplication(bytes32 _appId, string memory _reason)
        external onlyAuthority {
        Application storage app = applications[_appId];
        require(
            app.status == Status.Submitted || app.status == Status.Verified,
            "Cannot reject"
        );

        app.status = Status.Rejected;
        app.rejectionReason = _reason;
        app.lastUpdated = block.timestamp;

        emit ApplicationRejected(_appId, _reason);
    }

    function getApplication(bytes32 _appId) 
        external view returns (Application memory) {
        return applications[_appId];
    }

    function getMyApplications(address _applicant) 
        external view returns (bytes32[] memory) {
        return applicantApplications[_applicant];
    }

    function getTotalApplications() external view returns (uint256) {
        return allApplicationIds.length;
    }
}
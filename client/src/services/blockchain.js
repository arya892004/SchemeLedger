import { ethers } from 'ethers'

export const CONTRACT_ADDRESSES = {
  VerifierRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  SchemeRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  ApplicationLedger: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
}

export const APPLICATION_LEDGER_ABI = [
  "function submitApplication(bytes32 _schemeId, bytes32 _credentialHash, bytes32 _nullifierHash) external returns (bytes32)",
  "function getApplication(bytes32 _appId) external view returns (tuple(bytes32 appId, address applicant, bytes32 schemeId, bytes32 credentialHash, bytes32 nullifierHash, uint8 status, address verifier, uint256 submittedAt, uint256 lastUpdated, uint256 amountDisbursed, string rejectionReason))",
  "function getMyApplications(address _applicant) external view returns (bytes32[])",
  "function getTotalApplications() external view returns (uint256)",
  "event ApplicationSubmitted(bytes32 indexed appId, address indexed applicant, bytes32 indexed schemeId, uint256 timestamp)",
  "event ApplicationVerified(bytes32 indexed appId, address indexed verifier)",
  "event ApplicationApproved(bytes32 indexed appId)",
  "event FundsDisbursed(bytes32 indexed appId, address indexed beneficiary, uint256 amount, uint256 timestamp)",
  "event ApplicationRejected(bytes32 indexed appId, string reason)"
]

export const VERIFIER_REGISTRY_ABI = [
  "function isVerifier(address _addr) external view returns (bool)",
  "function isAuthority(address _addr) external view returns (bool)",
  "function addVerifier(address _verifier, string memory _name) external",
  "function addAuthority(address _authority) external",
  "function verifiers(address) external view returns (string name, bool isActive, uint256 totalVerifications, uint256 flaggedCount)"
]

export const SCHEME_REGISTRY_ABI = [
  "function publishScheme(string memory _name, string memory _description, string memory _ipfsMetadata, uint256 _totalBudget, uint256 _maxBeneficiaries) external returns (bytes32)",
  "function getScheme(bytes32 _schemeId) external view returns (tuple(bytes32 schemeId, string name, string description, string ipfsMetadata, uint256 totalBudget, uint256 disbursed, uint256 maxBeneficiaries, uint256 currentBeneficiaries, address authority, bool active, uint256 createdAt))",
  "function getAllSchemeIds() external view returns (bytes32[])",
  "function isSchemeActive(bytes32 _schemeId) external view returns (bool)"
]

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed. Please install MetaMask to continue.')
  }
  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  const network = await provider.getNetwork()
  return { provider, signer, address, chainId: network.chainId.toString() }
}

export async function submitApplicationOnChain(schemeId, aadhaarNumber, signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.ApplicationLedger,
    APPLICATION_LEDGER_ABI,
    signer
  )

  const nullifierHash = ethers.keccak256(
    ethers.toUtf8Bytes(aadhaarNumber + schemeId + 'schemeLedger2024')
  )
  const credentialHash = ethers.keccak256(
    ethers.toUtf8Bytes(aadhaarNumber + Date.now().toString())
  )
  const schemeIdBytes = ethers.keccak256(ethers.toUtf8Bytes(schemeId))

  const tx = await contract.submitApplication(schemeIdBytes, credentialHash, nullifierHash)
  const receipt = await tx.wait()

  return {
    txHash: receipt.hash,
    appId: receipt.logs[0]?.topics[1] || null,
    blockNumber: receipt.blockNumber
  }
}

export async function getMyApplicationsOnChain(address, provider) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.ApplicationLedger,
    APPLICATION_LEDGER_ABI,
    provider
  )
  return await contract.getMyApplications(address)
}

export async function getTotalApplications(provider) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.ApplicationLedger,
    APPLICATION_LEDGER_ABI,
    provider
  )
  return await contract.getTotalApplications()
}
const hre = require("hardhat");

async function main() {
  console.log("Deploying SchemeLedger contracts...\n");

  // 1. Deploy VerifierRegistry first
  const VerifierRegistry = await hre.ethers.getContractFactory("VerifierRegistry");
  const verifierRegistry = await VerifierRegistry.deploy();
  await verifierRegistry.waitForDeployment();
  const vrAddress = await verifierRegistry.getAddress();
  console.log(`✅ VerifierRegistry deployed: ${vrAddress}`);

  // 2. Deploy SchemeRegistry with VerifierRegistry address
  const SchemeRegistry = await hre.ethers.getContractFactory("SchemeRegistry");
  const schemeRegistry = await SchemeRegistry.deploy(vrAddress);
  await schemeRegistry.waitForDeployment();
  const srAddress = await schemeRegistry.getAddress();
  console.log(`✅ SchemeRegistry deployed: ${srAddress}`);

  // 3. Deploy ApplicationLedger with both addresses
  const ApplicationLedger = await hre.ethers.getContractFactory("ApplicationLedger");
  const applicationLedger = await ApplicationLedger.deploy(vrAddress, srAddress);
  await applicationLedger.waitForDeployment();
  const alAddress = await applicationLedger.getAddress();
  console.log(`✅ ApplicationLedger deployed: ${alAddress}`);

  // Save addresses for frontend
  const addresses = {
    VerifierRegistry: vrAddress,
    SchemeRegistry: srAddress,
    ApplicationLedger: alAddress,
    deployedAt: new Date().toISOString()
  };

  const fs = require("fs");
  fs.writeFileSync(
    "./deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  
  console.log("\n📄 Addresses saved to deployed-addresses.json");
  console.log("\n🔍 Verify on Polygonscan:");
  console.log(`https://mumbai.polygonscan.com/address/${alAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
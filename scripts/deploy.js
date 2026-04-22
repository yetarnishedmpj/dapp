import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("Marketplace deployed to:", address);

  // Write address to a file so Next.js can read it
  const srcPath = path.join(__dirname, '..', 'src');
  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath);
  }
  fs.writeFileSync(
    path.join(srcPath, 'config.js'),
    `export const marketplaceAddress = "${address}";\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
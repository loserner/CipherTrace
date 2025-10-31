import pkg from "hardhat";
const { ethers, network } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 开始在 Sepolia 部署合约 (使用 Hardhat 网络配置)...");

  // 环境输出
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const mnemonic = process.env.MNEMONIC;
  const privateKey = process.env.PRIVATE_KEY;
  if (!rpcUrl) {
    console.warn("⚠️ 未设置 SEPOLIA_RPC_URL，将使用 hardhat.config.js 中的默认配置");
  }
  if (!mnemonic && !privateKey) {
    console.warn("⚠️ 未检测到 MNEMONIC 或 PRIVATE_KEY，若账户为空将无法部署");
  }

  // 部署者与网络信息
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const { chainId, name } = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log("👤 部署者:", deployerAddress);
  console.log("💰 余额:", ethers.formatEther(balance), "ETH");
  console.log("🌐 网络:", name, `(${chainId})`);
  if (chainId !== 11155111n) {
    console.warn("⚠️ 当前网络链ID不是 11155111 (Sepolia)。请确认 --network sepolia 是否正确。");
  }

  // 1) 部署 FHEVMImplementation
  console.log("\n📦 部署 FHEVMImplementation...");
  const FHEVMImplementation = await ethers.getContractFactory("FHEVMImplementation");
  const fhevmImplementation = await FHEVMImplementation.deploy();
  await fhevmImplementation.waitForDeployment();
  const fhevmImplementationAddress = await fhevmImplementation.getAddress();
  console.log("✅ FHEVMImplementation 地址:", fhevmImplementationAddress);

  // 2) 部署 FHEVMPrivateAnalyzer(构造参数: IFHEVM 地址)
  console.log("\n📦 部署 FHEVMPrivateAnalyzer...");
  const FHEVMPrivateAnalyzer = await ethers.getContractFactory("FHEVMPrivateAnalyzer");
  const privateAnalyzer = await FHEVMPrivateAnalyzer.deploy(fhevmImplementationAddress);
  await privateAnalyzer.waitForDeployment();
  const privateAnalyzerAddress = await privateAnalyzer.getAddress();
  console.log("✅ FHEVMPrivateAnalyzer 地址:", privateAnalyzerAddress);

  // 3) 部署 TransactionAnalyzer
  console.log("\n📦 部署 TransactionAnalyzer...");
  const TransactionAnalyzer = await ethers.getContractFactory("TransactionAnalyzer");
  const transactionAnalyzer = await TransactionAnalyzer.deploy();
  await transactionAnalyzer.waitForDeployment();
  const transactionAnalyzerAddress = await transactionAnalyzer.getAddress();
  console.log("✅ TransactionAnalyzer 地址:", transactionAnalyzerAddress);

  // 4) 合约关系配置
  console.log("\n🔗 配置合约关系...");
  const tx1 = await transactionAnalyzer.setFHEVMAnalyzer(privateAnalyzerAddress);
  await tx1.wait();
  console.log("✅ 已在 TransactionAnalyzer 中设置 FHEVM 分析器");

  // 可选：再次显式启用（setFHEVMAnalyzer 内已设置为 true）
  // const tx2 = await transactionAnalyzer.setFHEVMEnabled(true);
  // await tx2.wait();

  // 5) 写出部署文件
  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = {
    network: {
      name,
      chainId: chainId.toString(),
      rpcUrl: rpcUrl || "<configured-in-hardhat.config.js>",
    },
    deployer: deployerAddress,
    contracts: {
      FHEVMImplementation: fhevmImplementationAddress,
      FHEVMPrivateAnalyzer: privateAnalyzerAddress,
      TransactionAnalyzer: transactionAnalyzerAddress,
    },
    timestamp: new Date().toISOString(),
  };
  const outPath = path.join(outDir, `sepolia-deployment-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("\n📝 部署信息已保存:", outPath);

  console.log("\n✅ 部署完成。可选验证命令:");
  console.log(`npx hardhat verify --network sepolia ${fhevmImplementationAddress}`);
  console.log(`npx hardhat verify --network sepolia ${privateAnalyzerAddress} ${fhevmImplementationAddress}`);
  console.log(`npx hardhat verify --network sepolia ${transactionAnalyzerAddress}`);
}

main().catch((err) => {
  console.error("❌ 部署失败:", err);
  process.exit(1);
});



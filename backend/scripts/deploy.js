import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("开始部署交易分析智能合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 部署TransactionAnalyzer合约
  console.log("\n部署TransactionAnalyzer合约...");
  const TransactionAnalyzer = await ethers.getContractFactory("TransactionAnalyzer");
  const transactionAnalyzer = await TransactionAnalyzer.deploy();
  await transactionAnalyzer.waitForDeployment();
  
  const transactionAnalyzerAddress = await transactionAnalyzer.getAddress();
  console.log("TransactionAnalyzer合约地址:", transactionAnalyzerAddress);

  // 部署PrivateDataAnalyzer合约
  console.log("\n部署PrivateDataAnalyzer合约...");
  const PrivateDataAnalyzer = await ethers.getContractFactory("PrivateDataAnalyzer");
  const privateDataAnalyzer = await PrivateDataAnalyzer.deploy();
  await privateDataAnalyzer.waitForDeployment();
  
  const privateDataAnalyzerAddress = await privateDataAnalyzer.getAddress();
  console.log("PrivateDataAnalyzer合约地址:", privateDataAnalyzerAddress);

  // 验证合约部署
  console.log("\n验证合约部署...");
  const txAnalyzerCode = await ethers.provider.getCode(transactionAnalyzerAddress);
  const privateAnalyzerCode = await ethers.provider.getCode(privateDataAnalyzerAddress);
  
  if (txAnalyzerCode !== "0x") {
    console.log("✅ TransactionAnalyzer合约部署成功");
  } else {
    console.log("❌ TransactionAnalyzer合约部署失败");
  }
  
  if (privateAnalyzerCode !== "0x") {
    console.log("✅ PrivateDataAnalyzer合约部署成功");
  } else {
    console.log("❌ PrivateDataAnalyzer合约部署失败");
  }

  // 输出部署信息
  console.log("\n=== 部署完成 ===");
  console.log("网络:", await ethers.provider.getNetwork().then(n => n.name));
  console.log("TransactionAnalyzer地址:", transactionAnalyzerAddress);
  console.log("PrivateDataAnalyzer地址:", privateDataAnalyzerAddress);
  
  // 保存部署信息到文件
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(), // 转换为字符串
    deployer: deployer.address,
    contracts: {
      TransactionAnalyzer: transactionAnalyzerAddress,
      PrivateDataAnalyzer: privateDataAnalyzerAddress
    },
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `deployment-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("部署信息已保存到:", filepath);
  
  // 如果是在测试网络上部署，提供验证命令
  if (network.chainId.toString() !== "1337" && network.chainId.toString() !== "31337") {
    console.log("\n=== 合约验证命令 ===");
    console.log(`npx hardhat verify --network ${network.name} ${transactionAnalyzerAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${privateDataAnalyzerAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getAllDeploymentFiles(deploymentsDir) {
  if (!fs.existsSync(deploymentsDir)) return [];
  return fs
    .readdirSync(deploymentsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(deploymentsDir, f));
}

function pickLatestDeploymentForChain(files, targetChainId) {
  let best = null;
  for (const file of files) {
    try {
      const stat = fs.statSync(file);
      const data = readJson(file);
      const chainIdRaw = data?.network?.chainId;
      const chainIdNum = typeof chainIdRaw === "string" ? Number(chainIdRaw) : Number(chainIdRaw);
      if (Number.isNaN(chainIdNum)) continue;
      if (chainIdNum !== targetChainId) continue;
      if (!best || stat.mtimeMs > best.mtimeMs) {
        best = { file, data, mtimeMs: stat.mtimeMs };
      }
    } catch (_) {
      // skip invalid files
    }
  }
  return best;
}

function resolveArtifactPath(contractName) {
  // artifacts/contracts/<Name>.sol/<Name>.json
  const candidates = [
    path.join(__dirname, "..", "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`),
    path.join(__dirname, "..", "artifacts", "contracts", `${contractName}/${contractName}.json`),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`找不到合约 ${contractName} 的artifact文件`);
}

async function main() {
  const targetChainId = Number(process.env.CHAIN_ID || 11155111);
  const explicitDeploymentFile = process.env.DEPLOY_FILE || null;

  const backendDir = path.join(__dirname, "..");
  const deploymentsDir = path.join(backendDir, "deployments");
  const frontendAbiDir = path.join(__dirname, "..", "..", "frontend", "src", "abi");
  ensureDir(frontendAbiDir);

  let deployment;
  if (explicitDeploymentFile) {
    const data = readJson(explicitDeploymentFile);
    deployment = { file: explicitDeploymentFile, data };
  } else {
    const files = getAllDeploymentFiles(deploymentsDir);
    const picked = pickLatestDeploymentForChain(files, targetChainId);
    if (!picked) {
      throw new Error(`未在 ${deploymentsDir} 找到 chainId=${targetChainId} 的部署记录`);
    }
    deployment = picked;
  }

  const contracts = deployment.data?.contracts || {};
  const toExport = [
    { name: "TransactionAnalyzer", address: contracts.TransactionAnalyzer },
    { name: "FHEVMPrivateAnalyzer", address: contracts.FHEVMPrivateAnalyzer },
    { name: "FHEVMImplementation", address: contracts.FHEVMImplementation },
  ].filter((c) => typeof c.address === "string" && c.address.startsWith("0x"));

  if (toExport.length === 0) {
    throw new Error("部署文件中未找到需要导出的合约地址");
  }

  // 导出 ABI 文件
  for (const item of toExport) {
    const artifactPath = resolveArtifactPath(item.name);
    const artifact = readJson(artifactPath);

    const outAbiPath = path.join(frontendAbiDir, `${item.name}.json`);
    const abiFileContent = { abi: artifact.abi };
    fs.writeFileSync(outAbiPath, JSON.stringify(abiFileContent, null, 2));
    console.log(`✅ ABI 导出完成: ${outAbiPath}`);
  }

  // 更新/生成地址映射文件
  const addressFile = path.join(frontendAbiDir, "addresses.json");
  let addressMap = {};
  if (fs.existsSync(addressFile)) {
    try { addressMap = readJson(addressFile); } catch (_) { addressMap = {}; }
  }
  if (!addressMap[targetChainId]) addressMap[targetChainId] = {};
  for (const item of toExport) {
    addressMap[targetChainId][item.name] = item.address;
  }
  fs.writeFileSync(addressFile, JSON.stringify(addressMap, null, 2));
  console.log(`✅ 地址映射已更新: ${addressFile}`);

  // 可选：生成 index.ts 快捷导出
  const indexTs = [
    `export { default as addresses } from './addresses.json';`,
    ...toExport.map((c) => `export { default as ${c.name} } from './${c.name}.json';`),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(frontendAbiDir, "index.ts"), indexTs);
  console.log("✅ 生成前端 ABI 索引: index.ts");

  console.log("\n🎉 已生成前端 ABI 与地址映射文件。");
  console.log(`链ID: ${targetChainId}`);
  console.log(`部署文件: ${deployment.file || explicitDeploymentFile}`);
}

main().catch((err) => {
  console.error("❌ 导出失败:", err.message || err);
  process.exit(1);
});



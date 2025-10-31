import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * FHEVM部署脚本
 * 部署FHEVM相关的智能合约
 */
async function deployFHEVMContracts() {
  console.log('🚀 开始部署FHEVM智能合约...');

  // 从环境变量获取配置
  const rpcUrl = process.env.FHEVM_RPC_URL || 'http://localhost:8545';
  const privateKey = process.env.PRIVATE_KEY;
  const chainId = parseInt(process.env.FHEVM_CHAIN_ID || '1337');

  if (!privateKey) {
    throw new Error('请设置 PRIVATE_KEY 环境变量');
  }

  // 创建provider和signer
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log('📡 连接到网络:', rpcUrl);
  console.log('👤 部署者地址:', await signer.getAddress());

  // 检查网络连接
  try {
    const network = await provider.getNetwork();
    console.log('🌐 网络信息:', {
      chainId: network.chainId.toString(),
      name: network.name
    });
  } catch (error) {
    console.error('❌ 网络连接失败:', error.message);
    throw error;
  }

  // 获取账户余额
  const balance = await provider.getBalance(await signer.getAddress());
  console.log('💰 账户余额:', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    console.warn('⚠️  账户余额为0，可能无法部署合约');
  }

  const deploymentResults = {};

  try {
    // 1. 部署FHEVMImplementation合约
    console.log('\n📦 部署 FHEVMImplementation 合约...');
    
    const fhevmImplementationArtifact = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../artifacts/contracts/FHEVMImplementation.sol/FHEVMImplementation.json'),
        'utf8'
      )
    );

    const fhevmImplementationFactory = new ethers.ContractFactory(
      fhevmImplementationArtifact.abi,
      fhevmImplementationArtifact.bytecode,
      signer
    );

    const fhevmImplementation = await fhevmImplementationFactory.deploy();
    await fhevmImplementation.waitForDeployment();
    const fhevmImplementationAddress = await fhevmImplementation.getAddress();

    console.log('✅ FHEVMImplementation 部署成功:', fhevmImplementationAddress);

    deploymentResults.fhevmImplementation = {
      address: fhevmImplementationAddress,
      transactionHash: fhevmImplementation.deploymentTransaction()?.hash
    };

    // 2. 部署FHEVMPrivateAnalyzer合约
    console.log('\n📦 部署 FHEVMPrivateAnalyzer 合约...');
    
    const privateAnalyzerArtifact = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../artifacts/contracts/FHEVMPrivateAnalyzer.sol/FHEVMPrivateAnalyzer.json'),
        'utf8'
      )
    );

    const privateAnalyzerFactory = new ethers.ContractFactory(
      privateAnalyzerArtifact.abi,
      privateAnalyzerArtifact.bytecode,
      signer
    );

    const privateAnalyzer = await privateAnalyzerFactory.deploy(fhevmImplementationAddress);
    await privateAnalyzer.waitForDeployment();
    const privateAnalyzerAddress = await privateAnalyzer.getAddress();

    console.log('✅ FHEVMPrivateAnalyzer 部署成功:', privateAnalyzerAddress);

    deploymentResults.privateAnalyzer = {
      address: privateAnalyzerAddress,
      transactionHash: privateAnalyzer.deploymentTransaction()?.hash
    };

    // 2. 部署TransactionAnalyzer合约
    console.log('\n📦 部署 TransactionAnalyzer 合约...');
    
    const transactionAnalyzerArtifact = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../artifacts/contracts/TransactionAnalyzer.sol/TransactionAnalyzer.json'),
        'utf8'
      )
    );

    const transactionAnalyzerFactory = new ethers.ContractFactory(
      transactionAnalyzerArtifact.abi,
      transactionAnalyzerArtifact.bytecode,
      signer
    );

    const transactionAnalyzer = await transactionAnalyzerFactory.deploy();
    await transactionAnalyzer.waitForDeployment();
    const transactionAnalyzerAddress = await transactionAnalyzer.getAddress();

    console.log('✅ TransactionAnalyzer 部署成功:', transactionAnalyzerAddress);

    deploymentResults.transactionAnalyzer = {
      address: transactionAnalyzerAddress,
      transactionHash: transactionAnalyzer.deploymentTransaction()?.hash
    };

    // 4. 配置合约关系
    console.log('\n🔗 配置合约关系...');
    
    // 设置FHEVM接口地址
    const setFHEVMInterfaceTx = await privateAnalyzer.setFHEVMInterface(fhevmImplementationAddress);
    await setFHEVMInterfaceTx.wait();
    console.log('✅ 已设置FHEVM接口地址');

    const setFHEVMAnalyzerTx = await transactionAnalyzer.setFHEVMAnalyzer(privateAnalyzerAddress);
    await setFHEVMAnalyzerTx.wait();
    console.log('✅ 已设置FHEVM分析器地址');

    const setFHEVMEnabledTx = await transactionAnalyzer.setFHEVMEnabled(true);
    await setFHEVMEnabledTx.wait();
    console.log('✅ 已启用FHEVM功能');

    // 5. 验证部署
    console.log('\n🔍 验证部署...');
    
    const isFHEVMAvailable = await transactionAnalyzer.isFHEVMAvailable();
    console.log('FHEVM可用性:', isFHEVMAvailable);

    const isFHEVMReady = await privateAnalyzer.isFHEVMReady();
    console.log('FHEVM就绪状态:', isFHEVMReady);

    const fhevmStats = await privateAnalyzer.getFHEVMStats();
    console.log('FHEVM统计:', {
      totalAnalyses: fhevmStats[0].toString(),
      totalData: fhevmStats[1].toString(),
      activeData: fhevmStats[2].toString()
    });

    const fhevmStatus = await privateAnalyzer.getFHEVMStatus();
    console.log('FHEVM状态:', {
      isConnected: fhevmStatus.isConnected,
      totalEncryptedData: fhevmStatus.totalEncryptedData.toString(),
      totalComputations: fhevmStatus.totalComputations.toString(),
      activeRequests: fhevmStatus.activeRequests.toString()
    });

    // 5. 保存部署结果
    const deploymentData = {
      network: {
        chainId: chainId,
        rpcUrl: rpcUrl,
        name: 'FHEVM Network'
      },
      deployer: {
        address: await signer.getAddress(),
        balance: ethers.formatEther(balance)
      },
      contracts: deploymentResults,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const deploymentFile = path.join(__dirname, '../deployments/fhevm-deployment.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

    console.log('\n🎉 FHEVM部署完成!');
    console.log('📄 部署信息已保存到:', deploymentFile);
    
    // 输出合约地址
    console.log('\n📋 合约地址:');
    console.log('FHEVMImplementation:', fhevmImplementationAddress);
    console.log('FHEVMPrivateAnalyzer:', privateAnalyzerAddress);
    console.log('TransactionAnalyzer:', transactionAnalyzerAddress);
    
    // 输出环境变量配置
    console.log('\n🔧 环境变量配置:');
    console.log(`FHEVM_RPC_URL=${rpcUrl}`);
    console.log(`FHEVM_CHAIN_ID=${chainId}`);
    console.log(`FHEVM_IMPLEMENTATION_ADDRESS=${fhevmImplementationAddress}`);
    console.log(`FHEVM_PRIVATE_ANALYZER_ADDRESS=${privateAnalyzerAddress}`);
    console.log(`FHEVM_TRANSACTION_ANALYZER_ADDRESS=${transactionAnalyzerAddress}`);

    return deploymentData;

  } catch (error) {
    console.error('❌ 部署失败:', error);
    throw error;
  }
}

/**
 * 验证FHEVM功能
 */
async function verifyFHEVMFunctionality() {
  console.log('\n🧪 验证FHEVM功能...');

  const rpcUrl = process.env.FHEVM_RPC_URL || 'http://localhost:8545';
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error('请设置 PRIVATE_KEY 环境变量');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  // 读取部署信息
  const deploymentFile = path.join(__dirname, '../deployments/fhevm-deployment.json');
  if (!fs.existsSync(deploymentFile)) {
    throw new Error('部署文件不存在，请先运行部署脚本');
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const { privateAnalyzer, transactionAnalyzer } = deploymentData.contracts;

  // 验证合约
  const privateAnalyzerContract = new ethers.Contract(
    privateAnalyzer.address,
    ['function getFHEVMStats() view returns (uint256, uint256, uint256)'],
    signer
  );

  const transactionAnalyzerContract = new ethers.Contract(
    transactionAnalyzer.address,
    ['function isFHEVMAvailable() view returns (bool)'],
    signer
  );

  try {
    const isFHEVMAvailable = await transactionAnalyzerContract.isFHEVMAvailable();
    console.log('✅ FHEVM可用性检查:', isFHEVMAvailable);

    const fhevmStats = await privateAnalyzerContract.getFHEVMStats();
    console.log('✅ FHEVM统计信息:', {
      totalAnalyses: fhevmStats[0].toString(),
      totalData: fhevmStats[1].toString(),
      activeData: fhevmStats[2].toString()
    });

    console.log('✅ FHEVM功能验证完成');
    return true;
  } catch (error) {
    console.error('❌ FHEVM功能验证失败:', error);
    return false;
  }
}

// 主函数
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'deploy':
        await deployFHEVMContracts();
        break;
      case 'verify':
        await verifyFHEVMFunctionality();
        break;
      case 'full':
        await deployFHEVMContracts();
        await verifyFHEVMFunctionality();
        break;
      default:
        console.log('使用方法:');
        console.log('  node deploy-fhevm.js deploy   - 部署FHEVM合约');
        console.log('  node deploy-fhevm.js verify   - 验证FHEVM功能');
        console.log('  node deploy-fhevm.js full     - 完整部署和验证');
        break;
    }
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

// 运行脚本（ESM环境下直接调用）
main();

export { deployFHEVMContracts, verifyFHEVMFunctionality };

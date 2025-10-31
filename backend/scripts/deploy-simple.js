const hre = require("hardhat");

async function main() {
  console.log('🚀 开始部署FHEVM智能合约...');

  // 获取部署者账户
  const [deployer] = await hre.ethers.getSigners();
  console.log('👤 部署者地址:', deployer.address);

  // 获取账户余额
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 账户余额:', hre.ethers.formatEther(balance), 'ETH');

  try {
    // 1. 部署FHEVMPrivateAnalyzer合约
    console.log('\n📦 部署 FHEVMPrivateAnalyzer 合约...');
    
    const FHEVMPrivateAnalyzer = await hre.ethers.getContractFactory("FHEVMPrivateAnalyzer");
    const privateAnalyzer = await FHEVMPrivateAnalyzer.deploy();
    await privateAnalyzer.waitForDeployment();
    const privateAnalyzerAddress = await privateAnalyzer.getAddress();

    console.log('✅ FHEVMPrivateAnalyzer 部署成功:', privateAnalyzerAddress);

    // 2. 部署TransactionAnalyzer合约
    console.log('\n📦 部署 TransactionAnalyzer 合约...');
    
    const TransactionAnalyzer = await hre.ethers.getContractFactory("TransactionAnalyzer");
    const transactionAnalyzer = await TransactionAnalyzer.deploy();
    await transactionAnalyzer.waitForDeployment();
    const transactionAnalyzerAddress = await transactionAnalyzer.getAddress();

    console.log('✅ TransactionAnalyzer 部署成功:', transactionAnalyzerAddress);

    // 3. 配置合约关系
    console.log('\n🔗 配置合约关系...');
    
    const setFHEVMAnalyzerTx = await transactionAnalyzer.setFHEVMAnalyzer(privateAnalyzerAddress);
    await setFHEVMAnalyzerTx.wait();
    console.log('✅ 已设置FHEVM分析器地址');

    const setFHEVMEnabledTx = await transactionAnalyzer.setFHEVMEnabled(true);
    await setFHEVMEnabledTx.wait();
    console.log('✅ 已启用FHEVM功能');

    // 4. 验证部署
    console.log('\n🔍 验证部署...');
    
    const isFHEVMAvailable = await transactionAnalyzer.isFHEVMAvailable();
    console.log('FHEVM可用性:', isFHEVMAvailable);

    // 5. 保存部署结果
    const deploymentData = {
      network: {
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        name: 'Hardhat Local'
      },
      deployer: {
        address: deployer.address,
        balance: hre.ethers.formatEther(balance)
      },
      contracts: {
        privateAnalyzer: {
          address: privateAnalyzerAddress,
          name: 'FHEVMPrivateAnalyzer'
        },
        transactionAnalyzer: {
          address: transactionAnalyzerAddress,
          name: 'TransactionAnalyzer'
        }
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const fs = require('fs');
    const path = require('path');
    const deploymentFile = path.join(__dirname, '../deployments/simple-deployment.json');
    
    // 确保目录存在
    const deploymentDir = path.dirname(deploymentFile);
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

    console.log('\n🎉 FHEVM部署完成!');
    console.log('📄 部署信息已保存到:', deploymentFile);
    
    // 输出合约地址
    console.log('\n📋 合约地址:');
    console.log('FHEVMPrivateAnalyzer:', privateAnalyzerAddress);
    console.log('TransactionAnalyzer:', transactionAnalyzerAddress);
    
    // 输出环境变量配置
    console.log('\n🔧 环境变量配置:');
    console.log(`FHEVM_PRIVATE_ANALYZER_ADDRESS=${privateAnalyzerAddress}`);
    console.log(`FHEVM_TRANSACTION_ANALYZER_ADDRESS=${transactionAnalyzerAddress}`);

    return deploymentData;

  } catch (error) {
    console.error('❌ 部署失败:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

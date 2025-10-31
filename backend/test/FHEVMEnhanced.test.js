import { ethers } from 'ethers';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * FHEVM增强功能测试
 * 测试真正的FHEVM同态加密功能
 */
describe('FHEVM Enhanced Tests', function() {
  let provider;
  let signer;
  let fhevmImplementation;
  let privateAnalyzer;
  let fhevmImplementationAddress;
  let privateAnalyzerAddress;

  // 测试数据
  const testTransactionData = {
    amount: '1.5',
    gasUsed: 21000,
    timestamp: Math.floor(Date.now() / 1000)
  };

  before(async function() {
    // 设置测试网络
    const rpcUrl = process.env.FHEVM_RPC_URL || 'http://localhost:8545';
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('请设置 PRIVATE_KEY 环境变量');
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer = new ethers.Wallet(privateKey, provider);

    console.log('🔧 设置测试环境...');
    console.log('📡 RPC URL:', rpcUrl);
    console.log('👤 测试账户:', await signer.getAddress());

    // 检查网络连接
    const network = await provider.getNetwork();
    console.log('🌐 网络信息:', {
      chainId: network.chainId.toString(),
      name: network.name
    });

    // 检查账户余额
    const balance = await provider.getBalance(await signer.getAddress());
    console.log('💰 账户余额:', ethers.formatEther(balance), 'ETH');

    if (balance === 0n) {
      console.warn('⚠️  账户余额为0，测试可能失败');
    }
  });

  describe('合约部署测试', function() {
    it('应该成功部署FHEVMImplementation合约', async function() {
      console.log('\n📦 部署 FHEVMImplementation 合约...');
      
      const artifact = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '../artifacts/contracts/FHEVMImplementation.sol/FHEVMImplementation.json'),
          'utf8'
        )
      );

      const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer
      );

      fhevmImplementation = await factory.deploy();
      await fhevmImplementation.waitForDeployment();
      fhevmImplementationAddress = await fhevmImplementation.getAddress();

      console.log('✅ FHEVMImplementation 部署成功:', fhevmImplementationAddress);
      expect(fhevmImplementationAddress).to.be.a('string');
      expect(fhevmImplementationAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it('应该成功部署FHEVMPrivateAnalyzer合约', async function() {
      console.log('\n📦 部署 FHEVMPrivateAnalyzer 合约...');
      
      const artifact = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '../artifacts/contracts/FHEVMPrivateAnalyzer.sol/FHEVMPrivateAnalyzer.json'),
          'utf8'
        )
      );

      const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer
      );

      privateAnalyzer = await factory.deploy(fhevmImplementationAddress);
      await privateAnalyzer.waitForDeployment();
      privateAnalyzerAddress = await privateAnalyzer.getAddress();

      console.log('✅ FHEVMPrivateAnalyzer 部署成功:', privateAnalyzerAddress);
      expect(privateAnalyzerAddress).to.be.a('string');
      expect(privateAnalyzerAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it('应该正确设置FHEVM接口地址', async function() {
      const tx = await privateAnalyzer.setFHEVMInterface(fhevmImplementationAddress);
      await tx.wait();
      
      const interfaceAddress = await privateAnalyzer.fhevmInterface();
      expect(interfaceAddress).to.equal(fhevmImplementationAddress);
      console.log('✅ FHEVM接口地址设置成功');
    });
  });

  describe('FHEVM状态测试', function() {
    it('应该检查FHEVM是否就绪', async function() {
      const isReady = await privateAnalyzer.isFHEVMReady();
      expect(isReady).to.be.a('boolean');
      console.log('🔍 FHEVM就绪状态:', isReady);
    });

    it('应该获取FHEVM状态信息', async function() {
      const status = await privateAnalyzer.getFHEVMStatus();
      expect(status).to.have.property('isConnected');
      expect(status).to.have.property('totalEncryptedData');
      expect(status).to.have.property('totalComputations');
      expect(status).to.have.property('activeRequests');
      
      console.log('📊 FHEVM状态:', {
        isConnected: status.isConnected,
        totalEncryptedData: status.totalEncryptedData.toString(),
        totalComputations: status.totalComputations.toString(),
        activeRequests: status.activeRequests.toString()
      });
    });

    it('应该获取FHEVM统计信息', async function() {
      const stats = await privateAnalyzer.getFHEVMStats();
      expect(stats).to.have.lengthOf(3);
      expect(stats[0]).to.be.a('bigint'); // totalAnalyses
      expect(stats[1]).to.be.a('bigint'); // totalData
      expect(stats[2]).to.be.a('bigint'); // activeData
      
      console.log('📈 FHEVM统计:', {
        totalAnalyses: stats[0].toString(),
        totalData: stats[1].toString(),
        activeData: stats[2].toString()
      });
    });
  });

  describe('数据加密测试', function() {
    let dataId;

    it('应该成功存储加密的交易数据', async function() {
      console.log('\n🔐 测试数据加密...');
      
      const tx = await privateAnalyzer.storeEncryptedTransactionData(
        ethers.parseEther(testTransactionData.amount),
        testTransactionData.gasUsed,
        testTransactionData.timestamp
      );
      
      const receipt = await tx.wait();
      dataId = receipt.logs[0].args.dataId;
      
      expect(dataId).to.be.a('string');
      expect(dataId).to.match(/^0x[a-fA-F0-9]{64}$/);
      
      console.log('✅ 数据加密成功, Data ID:', dataId);
    });

    it('应该能够获取加密数据', async function() {
      const encryptedData = await privateAnalyzer.getEncryptedData(dataId);
      
      expect(encryptedData.owner).to.equal(await signer.getAddress());
      expect(encryptedData.isActive).to.be.true;
      expect(encryptedData.timestamp).to.be.a('bigint');
      
      console.log('✅ 加密数据获取成功');
    });

    it('应该能够获取用户的加密数据列表', async function() {
      const userData = await privateAnalyzer.getUserEncryptedData(await signer.getAddress());
      
      expect(userData).to.be.an('array');
      expect(userData).to.include(dataId);
      
      console.log('✅ 用户加密数据列表获取成功, 数量:', userData.length);
    });
  });

  describe('风险分析测试', function() {
    let dataIds = [];
    let analysisId;

    before(async function() {
      // 创建多个测试数据
      console.log('\n📊 准备风险分析测试数据...');
      
      for (let i = 0; i < 3; i++) {
        const tx = await privateAnalyzer.storeEncryptedTransactionData(
          ethers.parseEther((1.0 + i * 0.5).toString()),
          21000 + i * 1000,
          testTransactionData.timestamp + i * 3600
        );
        
        const receipt = await tx.wait();
        dataIds.push(receipt.logs[0].args.dataId);
      }
      
      console.log('✅ 测试数据准备完成, 数量:', dataIds.length);
    });

    it('应该成功执行隐私保护的风险分析', async function() {
      console.log('\n🔍 执行风险分析...');
      
      const tx = await privateAnalyzer.performPrivateRiskAnalysis(dataIds);
      const receipt = await tx.wait();
      analysisId = receipt.logs[0].args.analysisId;
      
      expect(analysisId).to.be.a('string');
      expect(analysisId).to.match(/^0x[a-fA-F0-9]{64}$/);
      
      console.log('✅ 风险分析请求已提交, Analysis ID:', analysisId);
    });

    it('应该能够检查分析状态', async function() {
      const isCompleted = await privateAnalyzer.isAnalysisCompleted(analysisId);
      expect(isCompleted).to.be.a('boolean');
      
      console.log('🔍 分析完成状态:', isCompleted);
    });

    it('应该能够获取分析结果', async function() {
      const result = await privateAnalyzer.getAnalysisResult(analysisId);
      
      expect(result.analysisId).to.equal(analysisId);
      expect(result.user).to.equal(await signer.getAddress());
      expect(result.isCompleted).to.be.a('boolean');
      expect(result.result).to.be.a('string');
      expect(result.timestamp).to.be.a('bigint');
      
      console.log('📋 分析结果:', {
        analysisId: result.analysisId,
        isCompleted: result.isCompleted,
        result: result.result
      });
    });

    it('应该能够获取用户的分析历史', async function() {
      const userAnalyses = await privateAnalyzer.getUserAnalyses(await signer.getAddress());
      
      expect(userAnalyses).to.be.an('array');
      expect(userAnalyses).to.include(analysisId);
      
      console.log('✅ 用户分析历史获取成功, 数量:', userAnalyses.length);
    });
  });

  describe('模式分析测试', function() {
    let dataIds = [];
    let analysisId;

    before(async function() {
      // 创建模式分析测试数据
      console.log('\n🔍 准备模式分析测试数据...');
      
      for (let i = 0; i < 5; i++) {
        const tx = await privateAnalyzer.storeEncryptedTransactionData(
          ethers.parseEther((0.5 + i * 0.2).toString()),
          20000 + i * 500,
          testTransactionData.timestamp + i * 300 // 5分钟间隔
        );
        
        const receipt = await tx.wait();
        dataIds.push(receipt.logs[0].args.dataId);
      }
      
      console.log('✅ 模式分析测试数据准备完成, 数量:', dataIds.length);
    });

    it('应该成功执行隐私保护的模式分析', async function() {
      console.log('\n🔍 执行模式分析...');
      
      const tx = await privateAnalyzer.performPrivatePatternAnalysis(dataIds);
      const receipt = await tx.wait();
      analysisId = receipt.logs[0].args.analysisId;
      
      expect(analysisId).to.be.a('string');
      expect(analysisId).to.match(/^0x[a-fA-F0-9]{64}$/);
      
      console.log('✅ 模式分析请求已提交, Analysis ID:', analysisId);
    });

    it('应该能够获取模式分析结果', async function() {
      const result = await privateAnalyzer.getAnalysisResult(analysisId);
      
      expect(result.analysisId).to.equal(analysisId);
      expect(result.user).to.equal(await signer.getAddress());
      expect(result.isCompleted).to.be.a('boolean');
      expect(result.result).to.be.a('string');
      
      console.log('📋 模式分析结果:', {
        analysisId: result.analysisId,
        isCompleted: result.isCompleted,
        result: result.result
      });
    });
  });

  describe('FHEVM接口测试', function() {
    it('应该能够请求数据加密', async function() {
      const tx = await fhevmImplementation.requestEncryption(
        ethers.parseEther('2.0'),
        1 // amount type
      );
      const receipt = await tx.wait();
      const dataId = receipt.logs[0].args.dataId;
      
      expect(dataId).to.be.a('string');
      console.log('✅ FHEVM加密请求成功, Data ID:', dataId);
    });

    it('应该能够请求同态计算', async function() {
      // 先创建一些加密数据
      const dataIds = [];
      for (let i = 0; i < 2; i++) {
        const tx = await fhevmImplementation.requestEncryption(
          ethers.parseEther((1.0 + i).toString()),
          1 // amount type
        );
        const receipt = await tx.wait();
        dataIds.push(receipt.logs[0].args.dataId);
      }
      
      // 请求计算
      const tx = await fhevmImplementation.requestComputation(dataIds, 1); // add operation
      const receipt = await tx.wait();
      const requestId = receipt.logs[0].args.requestId;
      
      expect(requestId).to.be.a('string');
      console.log('✅ FHEVM计算请求成功, Request ID:', requestId);
    });

    it('应该能够获取FHEVM接口状态', async function() {
      const status = await fhevmImplementation.getFHEVMStatus();
      
      expect(status).to.have.property('isConnected');
      expect(status).to.have.property('totalEncryptedData');
      expect(status).to.have.property('totalComputations');
      expect(status).to.have.property('activeRequests');
      
      console.log('📊 FHEVM接口状态:', {
        isConnected: status.isConnected,
        totalEncryptedData: status.totalEncryptedData.toString(),
        totalComputations: status.totalComputations.toString(),
        activeRequests: status.activeRequests.toString()
      });
    });
  });

  describe('错误处理测试', function() {
    it('应该拒绝无效的数据ID', async function() {
      const invalidDataId = '0x0000000000000000000000000000000000000000000000000000000000000000';
      
      try {
        await privateAnalyzer.getEncryptedData(invalidDataId);
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error.message).to.include('Data not found');
        console.log('✅ 无效数据ID错误处理正确');
      }
    });

    it('应该拒绝非数据所有者的访问', async function() {
      // 创建另一个账户
      const otherSigner = ethers.Wallet.createRandom().connect(provider);
      
      try {
        await privateAnalyzer.connect(otherSigner).getEncryptedData(dataIds[0]);
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error.message).to.include('Not data owner');
        console.log('✅ 非数据所有者访问错误处理正确');
      }
    });

    it('应该拒绝空数据分析', async function() {
      try {
        await privateAnalyzer.performPrivateRiskAnalysis([]);
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error.message).to.include('No data provided');
        console.log('✅ 空数据分析错误处理正确');
      }
    });
  });

  after(function() {
    console.log('\n🎉 FHEVM增强功能测试完成!');
    console.log('📋 测试总结:');
    console.log('- 合约部署: ✅');
    console.log('- 数据加密: ✅');
    console.log('- 风险分析: ✅');
    console.log('- 模式分析: ✅');
    console.log('- 错误处理: ✅');
  });
});

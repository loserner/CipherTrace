const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TransactionAnalyzer", function () {
  let transactionAnalyzer;
  let owner;
  let addr1;
  let addr2;
  let suspiciousAddr;

  beforeEach(async function () {
    [owner, addr1, addr2, suspiciousAddr] = await ethers.getSigners();
    
    const TransactionAnalyzer = await ethers.getContractFactory("TransactionAnalyzer");
    transactionAnalyzer = await TransactionAnalyzer.deploy();
    await transactionAnalyzer.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置合约所有者", async function () {
      expect(await transactionAnalyzer.owner()).to.equal(owner.address);
    });

    it("应该设置默认风险阈值", async function () {
      expect(await transactionAnalyzer.riskThreshold()).to.equal(70);
    });
  });

  describe("交易分析", function () {
    it("应该能够添加和分析交易", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test transaction"));
      const value = ethers.parseEther("1.0");
      const gasUsed = 21000;

      await expect(
        transactionAnalyzer.addTransaction(
          addr1.address,
          addr2.address,
          value,
          gasUsed,
          txHash
        )
      ).to.emit(transactionAnalyzer, "TransactionAnalyzed");

      const analysis = await transactionAnalyzer.getTransactionAnalysis(txHash);
      expect(analysis.riskScore).to.be.a("BigNumber");
      expect(analysis.isSuspicious).to.be.a("boolean");
    });

    it("应该检测大额交易风险", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("large transaction"));
      const value = ethers.parseEther("150.0"); // 超过100 ETH
      const gasUsed = 21000;

      await transactionAnalyzer.addTransaction(
        addr1.address,
        addr2.address,
        value,
        gasUsed,
        txHash
      );

      const analysis = await transactionAnalyzer.getTransactionAnalysis(txHash);
      expect(analysis.riskScore).to.be.greaterThan(20); // 应该包含大额交易风险
    });

    it("应该检测高gas使用风险", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("high gas transaction"));
      const value = ethers.parseEther("1.0");
      const gasUsed = 600000; // 超过500000

      await transactionAnalyzer.addTransaction(
        addr1.address,
        addr2.address,
        value,
        gasUsed,
        txHash
      );

      const analysis = await transactionAnalyzer.getTransactionAnalysis(txHash);
      expect(analysis.riskScore).to.be.greaterThan(15); // 应该包含高gas风险
    });
  });

  describe("可疑地址管理", function () {
    it("应该能够添加可疑地址", async function () {
      const reason = "Known scam address";
      
      await expect(
        transactionAnalyzer.addSuspiciousAddress(suspiciousAddr.address, reason)
      ).to.emit(transactionAnalyzer, "SuspiciousAddressAdded")
        .withArgs(suspiciousAddr.address, reason);

      expect(await transactionAnalyzer.isSuspiciousAddress(suspiciousAddr.address)).to.be.true;
    });

    it("应该能够移除可疑地址", async function () {
      await transactionAnalyzer.addSuspiciousAddress(suspiciousAddr.address, "Test reason");
      
      await expect(
        transactionAnalyzer.removeSuspiciousAddress(suspiciousAddr.address)
      ).to.emit(transactionAnalyzer, "SuspiciousAddressRemoved")
        .withArgs(suspiciousAddr.address);

      expect(await transactionAnalyzer.isSuspiciousAddress(suspiciousAddr.address)).to.be.false;
    });

    it("应该检测涉及可疑地址的交易", async function () {
      await transactionAnalyzer.addSuspiciousAddress(suspiciousAddr.address, "Test reason");
      
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("suspicious transaction"));
      const value = ethers.parseEther("1.0");
      const gasUsed = 21000;

      await transactionAnalyzer.addTransaction(
        suspiciousAddr.address,
        addr2.address,
        value,
        gasUsed,
        txHash
      );

      const analysis = await transactionAnalyzer.getTransactionAnalysis(txHash);
      expect(analysis.riskScore).to.be.greaterThan(30); // 应该包含可疑地址风险
    });
  });

  describe("用户交易历史", function () {
    it("应该能够获取用户交易历史", async function () {
      const txHash1 = ethers.keccak256(ethers.toUtf8Bytes("transaction 1"));
      const txHash2 = ethers.keccak256(ethers.toUtf8Bytes("transaction 2"));
      const value = ethers.parseEther("1.0");
      const gasUsed = 21000;

      await transactionAnalyzer.addTransaction(
        addr1.address,
        addr2.address,
        value,
        gasUsed,
        txHash1
      );

      await transactionAnalyzer.addTransaction(
        addr1.address,
        addr2.address,
        value,
        gasUsed,
        txHash2
      );

      const userTxs = await transactionAnalyzer.getUserTransactions(addr1.address);
      expect(userTxs).to.have.lengthOf(2);
      expect(userTxs[0]).to.equal(txHash1);
      expect(userTxs[1]).to.equal(txHash2);
    });
  });

  describe("风险阈值管理", function () {
    it("应该能够更新风险阈值", async function () {
      const newThreshold = 80;
      
      await expect(
        transactionAnalyzer.updateRiskThreshold(newThreshold)
      ).to.emit(transactionAnalyzer, "RiskThresholdUpdated")
        .withArgs(70, newThreshold);

      expect(await transactionAnalyzer.riskThreshold()).to.equal(newThreshold);
    });

    it("应该拒绝无效的风险阈值", async function () {
      await expect(
        transactionAnalyzer.updateRiskThreshold(101)
      ).to.be.revertedWith("Risk score must be <= 100");
    });
  });

  describe("地址风险评分", function () {
    it("应该能够设置地址风险评分", async function () {
      const riskScore = 50;
      
      await transactionAnalyzer.setAddressRiskScore(addr1.address, riskScore);
      
      // 通过添加交易来验证风险评分被应用
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test with risk score"));
      const value = ethers.parseEther("1.0");
      const gasUsed = 21000;

      await transactionAnalyzer.addTransaction(
        addr1.address,
        addr2.address,
        value,
        gasUsed,
        txHash
      );

      const analysis = await transactionAnalyzer.getTransactionAnalysis(txHash);
      expect(analysis.riskScore).to.be.greaterThan(riskScore);
    });
  });

  describe("访问控制", function () {
    it("只有所有者能够添加交易", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("unauthorized transaction"));
      const value = ethers.parseEther("1.0");
      const gasUsed = 21000;

      await expect(
        transactionAnalyzer.connect(addr1).addTransaction(
          addr1.address,
          addr2.address,
          value,
          gasUsed,
          txHash
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("只有所有者能够管理可疑地址", async function () {
      await expect(
        transactionAnalyzer.connect(addr1).addSuspiciousAddress(suspiciousAddr.address, "reason")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});

# CipherTrace

**Privacy-preserving transaction analysis on Zama FHEVM**

CipherTrace provides encrypted transaction analysis where sensitive financial data remains private during processing. Built on Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM), the platform enables risk assessment, pattern detection, and compliance checks over encrypted transaction data without ever decrypting individual transactions.

---

## Introduction

Traditional transaction analysis requires exposing sensitive financial data to analysis systems. CipherTrace solves this fundamental privacy challenge by performing all analytics over encrypted data using Zama FHEVM, ensuring that transaction details remain confidential while still enabling sophisticated risk analysis and compliance verification.

**Key Innovation**: Homomorphic risk scoring and pattern analysis over encrypted transaction vectors, revealing only aggregate statistics and risk flags—never individual transaction details.

---

## Core Capabilities

### Encrypted Risk Assessment
- Risk scoring computed over encrypted transaction amounts and frequencies
- Pattern detection (anomaly detection, velocity checks) without plaintext access
- Multi-factor risk models using homomorphic operations

### Privacy-Preserving Analytics
- Transaction volume analysis over encrypted totals
- Time-series pattern detection without revealing timestamps
- Cross-wallet correlation analysis with encrypted identifiers

### Compliance & Reporting
- Regulatory compliance checks on encrypted data
- Audit trails with cryptographic proofs
- Automated flagging without exposing transaction details

---

## System Architecture

```
┌─────────────────────┐
│  Transaction Input  │
│  (Encrypted Amount) │
└──────────┬──────────┘
           │ euint64 encryptedTx
           ▼
┌──────────────────────────────────────┐
│   Zama FHEVM Smart Contracts        │
│  ┌──────────────────────────────┐  │
│  │ Risk Analysis Engine (FHE)    │  │
│  │ ├─ Amount analysis            │  │
│  │ ├─ Frequency checks           │  │
│  │ ├─ Pattern detection          │  │
│  │ └─ Velocity analysis          │  │
│  └──────────────────────────────┘  │
│  └─ Result: euint64 riskScore     │  │
└──────────────┬─────────────────────┘
               │
               ▼
┌─────────────────────┐
│  Reveal Mechanism   │
│  (Threshold Keys)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Risk Flags & Stats │
│  (Public Output)    │
└─────────────────────┘
```

**Components:**
- **Frontend**: React/TypeScript interface for submitting encrypted transactions
- **Backend API**: Node.js service handling FHEVM operations and key management
- **Smart Contracts**: Solidity contracts using Zama FHEVM for homomorphic analysis
- **Storage**: Encrypted transaction data with integrity proofs

---

## Technical Implementation

### FHE Data Structures

```solidity
// Encrypted transaction
euint64 encryptedAmount;
euint32 encryptedTimestamp;
ebool isFlagged;

// Encrypted risk score
euint64 riskScore;

// Homomorphic operations
euint64 totalVolume = TFHE.add(tx1, tx2, tx3, ...);
ebool exceedsThreshold = TFHE.gt(totalVolume, limit);
euint64 average = TFHE.div(totalVolume, count);
```

### Homomorphic Analysis Operations

**Risk Scoring Algorithm:**
1. Receive encrypted transaction amounts
2. Compute homomorphic sum for volume analysis
3. Compare against encrypted thresholds
4. Generate encrypted risk score
5. Reveal only final risk flags (not individual scores)

**Pattern Detection:**
- Frequency analysis over encrypted time windows
- Anomaly detection using encrypted statistical operations
- Velocity checks computed homomorphically

### API Endpoints

```typescript
// Submit encrypted transaction for analysis
POST /api/analyze
{
  encryptedAmount: string,
  encryptedMetadata: string,
  publicKey: string
}

// Get risk assessment (encrypted)
GET /api/risk/:transactionId

// Reveal risk flags (requires threshold keys)
POST /api/reveal
{
  transactionId: string,
  decryptionKey: string
}
```

---

## Privacy Guarantees

### What Remains Private

| Data Type | Privacy Level |
|-----------|--------------|
| Transaction amounts | Fully encrypted during analysis |
| Transaction timestamps | Encrypted time windows only |
| Wallet addresses | Pseudonymized identifiers |
| Transaction patterns | Computed over encrypted data |
| Risk scores (individual) | Encrypted until aggregation |

### What Can Be Revealed

| Information | Disclosure Level |
|-------------|-----------------|
| Aggregate statistics | Public (e.g., total volume) |
| Risk flags | Public (boolean high/low risk) |
| Compliance status | Public (pass/fail) |
| Audit proofs | Public (cryptographic proofs) |

### Threat Model

**Protected Against:**
- Individual transaction exposure
- Pattern inference attacks
- Correlation with external data
- Timing analysis (mitigated via batching)

**Limitations:**
- Metadata leakage (network-level timing)
- Aggregate statistics inference
- Future quantum computing threats

---

## Use Cases

### Financial Institutions

**Challenge**: Need transaction monitoring for compliance without exposing customer data

**Solution**: CipherTrace analyzes encrypted transactions, revealing only risk flags and compliance status

**Example**: AML screening, fraud detection, suspicious activity reporting

### Regulatory Compliance

**Challenge**: Prove compliance without exposing sensitive transaction data

**Solution**: Cryptographic proofs of compliance checks performed over encrypted data

**Example**: KYC verification, transaction limit enforcement, reporting requirements

### Private Transaction Monitoring

**Challenge**: Monitor wallet activity for risk without exposing transaction details

**Solution**: Encrypted risk scoring and pattern detection

**Example**: Personal wallet monitoring, multi-signature risk assessment, portfolio analysis

---

## Getting Started

### Prerequisites

```bash
# Required software
- Node.js 18+
- Docker & Docker Compose
- MetaMask or compatible wallet
- Access to FHEVM-enabled network (Sepolia testnet)
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/loserner/ciphertrace.git
cd ciphertrace

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Start services with Docker
docker-compose up -d

# Or run locally
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

### First Analysis

1. **Connect Wallet**: Use MetaMask to connect to Sepolia testnet
2. **Generate FHE Keys**: Frontend generates keypair for encryption
3. **Encrypt Transaction**: Submit transaction amount encrypted with FHE public key
4. **Analyze**: Smart contract performs homomorphic risk analysis
5. **Review Results**: View risk flags and compliance status

---

## Configuration

### Environment Variables

```env
# Backend (.env)
FHEVM_NODE_URL=https://your-fhevm-node.com
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x...
NETWORK=sepolia

# Frontend (.env.local)
VITE_CONTRACT_ADDRESS=0x...
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### Risk Scoring Parameters

Configure thresholds and weights in smart contract:
- Maximum transaction amount
- Velocity limits (transactions per time window)
- Risk score thresholds
- Pattern detection sensitivity

---

## Performance Considerations

### Gas Costs

| Operation | Estimated Gas |
|-----------|--------------|
| Submit encrypted transaction | ~120,000 |
| Risk analysis (10 transactions) | ~800,000 |
| Risk analysis (100 transactions) | ~3,500,000 |
| Reveal risk flags | ~150,000 |

### Optimization Strategies

- **Batch Processing**: Aggregate multiple transactions before analysis
- **Caching**: Reuse encrypted intermediate results
- **Lazy Evaluation**: Defer expensive operations until reveal
- **Off-Chain Computation**: Perform some analysis off-chain, verify on-chain

---

## Security Best Practices

### Key Management

- Store FHE private keys in hardware wallets or secure enclaves
- Use threshold cryptography for key fragments
- Implement key rotation policies
- Secure key backup and recovery procedures

### Operational Security

- Regular security audits of smart contracts
- Monitor for anomalous patterns in risk scores
- Implement rate limiting for API endpoints
- Use HTTPS for all network communications

### Compliance

- Maintain audit logs of all operations
- Implement access controls for sensitive functions
- Follow data retention policies
- Ensure regulatory compliance (GDPR, etc.)

---

## Development

### Project Structure

```
ciphertrace/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # FHEVM integration
│   │   └── test/     # Test files
│   └── hardhat/      # Smart contract config
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/     # FHEVM hooks
│   │   └── pages/
└── contracts/        # Solidity contracts
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Smart contract tests
npx hardhat test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

**Guidelines:**
- Follow security best practices for FHE applications
- Maintain 80%+ test coverage
- Document all public APIs
- Update README for significant changes

---

## Roadmap

### Phase 1: Core Platform ✅
- Encrypted transaction submission
- Basic risk scoring with FHEVM
- Frontend interface
- API backend

### Phase 2: Enhanced Analytics 🔄
- Advanced pattern detection
- Machine learning integration
- Real-time monitoring dashboard
- Historical analysis tools

### Phase 3: Enterprise Features 📋
- Multi-tenant support
- Custom risk models
- Regulatory compliance modules
- API for third-party integrations

### Phase 4: Advanced Privacy 📋
- Zero-knowledge proofs for enhanced privacy
- Cross-chain analysis
- Decentralized key management
- Post-quantum cryptography support

---

## FAQ

**Q: How private are transactions if they're on a public blockchain?**  
A: Transactions are encrypted using FHE before being stored on-chain. Only encrypted ciphertexts are visible, and analysis is performed homomorphically without decryption.

**Q: Can risk scores be manipulated?**  
A: Risk scores are computed using cryptographic operations that cannot be manipulated. The FHE operations ensure deterministic results that can be publicly verified.

**Q: What happens if the FHE keys are compromised?**  
A: Keys are managed using threshold cryptography. Compromising a single key fragment is insufficient. Key rotation policies ensure compromised keys can be rotated without data loss.

**Q: How expensive are FHE operations?**  
A: FHE operations have higher gas costs than plaintext operations, but CipherTrace uses batching and optimization techniques to keep costs reasonable. Typical analysis of 100 transactions costs ~3.5M gas.

**Q: Is CipherTrace compatible with existing compliance tools?**  
A: Yes! CipherTrace provides APIs that can integrate with existing AML, KYC, and compliance platforms, providing encrypted analysis capabilities to existing workflows.

**Q: What networks does CipherTrace support?**  
A: Currently supports Sepolia testnet. Mainnet support planned after additional security audits.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

CipherTrace is built on cutting-edge privacy technology:

- **[Zama FHEVM](https://www.zama.ai/fhevm)**: Fully Homomorphic Encryption Virtual Machine for Ethereum
- **[Zama](https://www.zama.ai/)**: Pioneering FHE research and developer tooling
- **Ethereum Foundation**: Decentralized infrastructure

Special thanks to the Zama team for making fully homomorphic encryption accessible to developers and enabling a new generation of privacy-preserving applications.

---

## Contact & Links

- **Repository**: [GitHub](https://github.com/loserner/ciphertrace)
- **Documentation**: [Full Docs](https://docs.ciphertrace.io)
- **Discord**: [Community](https://discord.gg/ciphertrace)
- **Twitter**: [@CipherTrace](https://twitter.com/ciphertrace)

---

**CipherTrace** - Analyze transactions, not expose them.

_Powered by Zama FHEVM_


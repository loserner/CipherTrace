/**
 * 验证工具函数
 */

// 验证以太坊地址
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// 验证交易哈希
export function isValidTxHash(txHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash)
}

// 验证私钥
export function isValidPrivateKey(privateKey: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey)
}

// 验证助记词
export function isValidMnemonic(mnemonic: string): boolean {
  const words = mnemonic.trim().split(/\s+/)
  return words.length === 12 || words.length === 24
}

// 验证数值
export function isValidNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && isFinite(num) && num >= 0
}

// 验证正数
export function isValidPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && isFinite(num) && num > 0
}

// 验证整数
export function isValidInteger(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && isFinite(num) && Number.isInteger(num)
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 验证JSON字符串
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

// 验证风险评分
export function isValidRiskScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 100
}

// 验证时间戳
export function isValidTimestamp(timestamp: number): boolean {
  const now = Date.now() / 1000
  const minTimestamp = 946684800 // 2000-01-01
  return Number.isInteger(timestamp) && timestamp >= minTimestamp && timestamp <= now + 86400
}

// 验证链ID
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0
}

// 验证代币符号
export function isValidTokenSymbol(symbol: string): boolean {
  return /^[A-Z0-9]{1,10}$/.test(symbol)
}

// 验证代币精度
export function isValidTokenDecimals(decimals: number): boolean {
  return Number.isInteger(decimals) && decimals >= 0 && decimals <= 18
}

// 验证Gas限制
export function isValidGasLimit(gasLimit: number): boolean {
  return Number.isInteger(gasLimit) && gasLimit > 0 && gasLimit <= 30000000
}

// 验证Gas价格
export function isValidGasPrice(gasPrice: number): boolean {
  return Number.isInteger(gasPrice) && gasPrice > 0 && gasPrice <= 1000000000 // 1000 Gwei
}

// 验证交易值
export function isValidTransactionValue(value: string): boolean {
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num) && num >= 0
}

// 验证标签
export function isValidLabel(label: string): boolean {
  return label.length > 0 && label.length <= 50 && /^[a-zA-Z0-9\u4e00-\u9fa5\s_-]+$/.test(label)
}

// 验证描述
export function isValidDescription(description: string): boolean {
  return description.length <= 500
}

// 验证密码强度
export function getPasswordStrength(password: string): {
  score: number
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push('密码长度至少8位')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('需要包含小写字母')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('需要包含大写字母')
  } else {
    score += 1
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('需要包含数字')
  } else {
    score += 1
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('需要包含特殊字符')
  } else {
    score += 1
  }

  let level: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score < 2) {
    level = 'weak'
  } else if (score < 4) {
    level = 'medium'
  } else if (score < 5) {
    level = 'strong'
  } else {
    level = 'very-strong'
  }

  return { score, level, feedback }
}

// 验证表单字段
export function validateFormField(
  value: any,
  rules: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => string | null
  }
): string | null {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return '此字段为必填项'
  }

  if (value && rules.minLength && value.toString().length < rules.minLength) {
    return `最少需要${rules.minLength}个字符`
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength) {
    return `最多允许${rules.maxLength}个字符`
  }

  if (value && rules.pattern && !rules.pattern.test(value.toString())) {
    return '格式不正确'
  }

  if (value && rules.custom) {
    return rules.custom(value)
  }

  return null
}

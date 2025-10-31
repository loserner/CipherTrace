/**
 * 格式化地址显示
 * @param address 钱包地址
 * @param startLength 开头保留长度
 * @param endLength 结尾保留长度
 * @returns 格式化后的地址
 */
export function formatAddress(
  address: string, 
  startLength: number = 6, 
  endLength: number = 4
): string {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * 格式化数字显示
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export function formatNumber(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * 格式化代币数量
 * @param value 代币数量（wei单位）
 * @param decimals 代币精度
 * @returns 格式化后的代币数量
 */
export function formatTokenAmount(value: string | bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals)
  const amount = BigInt(value)
  
  const wholePart = amount / divisor
  const fractionalPart = amount % divisor
  
  if (fractionalPart === 0n) {
    return wholePart.toString()
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const trimmedFractional = fractionalStr.replace(/0+$/, '')
  
  if (trimmedFractional === '') {
    return wholePart.toString()
  }
  
  return `${wholePart}.${trimmedFractional}`
}

/**
 * 格式化时间显示
 * @param timestamp 时间戳（秒）
 * @returns 格式化后的时间字符串
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

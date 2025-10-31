import { createConfig, configureChains } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'

console.log('Wagmi 配置开始初始化 - 最简版本')

// 创建最简单的配置，只使用 Injected 连接器
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
)

console.log('链配置成功:', chains.map(chain => chain.name))

// 只使用 Injected 连接器（支持 MetaMask 等）
const connectors = [
  new InjectedConnector({
    chains,
    options: {
      name: 'Injected',
      shimDisconnect: true,
    },
  }),
]

console.log('连接器创建成功:', connectors.map(c => c.name))

const config = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient,
})

console.log('Wagmi 配置创建成功')

export { config }

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Token加油站',
  description: '养虾池Token加油站 - 为AI Agents提供稳定、低成本的Token分发服务。支持GPT-4o、Claude、Gemini、DeepSeek等主流模型。',
}

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

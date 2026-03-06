import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.agent-skills.net.cn'),
  title: {
    default: 'SkillHub China - 中国AI Agent技能市场 | 开源技能库',
    template: '%s | SkillHub China'
  },
  other: {
    'baidu-site-verification': 'codeva-OMLPU6Jud7',
  },
  description: '中国首个针对OpenClaw和渠道机器人的开源技能市场。提供150+精选AI Agent技能，包含天气查询、文档总结、Notion同步、GitHub操作等必备工具。支持一键安装，免费使用，国内访问快速。',
  keywords: ['AI Agent', 'OpenClaw', '技能市场', 'ClawBot', '自动化', '工作流', 'AI工具', 'GPTs', 'Agent技能', '开源技能'],
  authors: [{ name: 'SkillHub China' }],
  creator: 'SkillHub China',
  publisher: 'SkillHub China',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.agent-skills.net.cn',
    siteName: 'SkillHub China',
    title: 'SkillHub China - 中国AI Agent技能市场',
    description: '中国首个针对OpenClaw和渠道机器人的开源技能市场。150+精选AI Agent技能，一键安装，免费使用。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillHub China - 中国AI Agent技能市场'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillHub China - 中国AI Agent技能市场',
    description: '中国首个针对OpenClaw和渠道机器人的开源技能市场',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.agent-skills.net.cn',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Film, Sparkles, Zap, Palette, ArrowRight, Play, Star, Check } from 'lucide-react'

function Home() {
  const [examplePrompt, setExamplePrompt] = useState('')

  const examples = [
    '一个穷小子意外获得超能力，开始逆袭人生...',
    '现代女医生穿越到古代，用医术改变命运...',
    '失忆的霸道总裁爱上平凡女孩...',
    '普通大学生获得系统，开启修仙之路...',
  ]

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI智能生成',
      description: '基于GPT-4/Claude等大模型，一句话生成80集完整剧本'
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: '视觉资产生成',
      description: '自动生成Midjourney专业级提示词，包含角色、场景、道具'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '付费卡点设计',
      description: '专业设计的付费转化点，提高短剧商业价值'
    },
    {
      icon: <Film className="w-6 h-6" />,
      title: '多种类型风格',
      description: '支持爽剧、悬疑、喜剧、虐心等多种短剧类型'
    }
  ]

  const steps = [
    { step: 1, title: '输入想法', desc: '一句话描述你的创意' },
    { step: 2, title: 'AI生成', desc: '2-3分钟生成完整剧本' },
    { step: 3, title: '下载使用', desc: '获取剧本和视觉资产' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-primary-100">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-gray-700">AI驱动的短剧创作工具</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              一句话生成
              <span className="gradient-text"> 80集完整短剧剧本</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              基于专业编剧智能体，将你的想法转化为包含付费卡点、视觉资产的完整短剧剧本
            </p>

            {/* Input Demo */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-2xl mx-auto">
              <textarea
                value={examplePrompt}
                onChange={(e) => setExamplePrompt(e.target.value)}
                placeholder="输入你的想法，例如：一个穷小子意外获得超能力，开始逆袭人生..."
                className="textarea text-lg mb-4"
                rows={3}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/create" className="btn-primary flex-1 text-lg py-3">
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始创作
                </Link>
                <button className="btn-secondary flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  查看示例
                </button>
              </div>
            </div>

            {/* Example Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500">热门创意：</span>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setExamplePrompt(ex)}
                  className="text-sm px-3 py-1 bg-white/60 hover:bg-white rounded-full text-gray-600 transition-colors border border-gray-200"
                >
                  {ex.slice(0, 15)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">为什么选择影刃AI？</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              专业级短剧剧本生成工具，让你的创意快速变现
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">三步生成专业剧本</h2>
            <p className="text-gray-600">简单快捷，让创作更高效</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="relative">
                <div className="card p-8 text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">灵活的定价方案</h2>
            <p className="text-gray-600">从免费开始，按需升级</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="card p-8">
              <h3 className="text-xl font-semibold mb-2">免费版</h3>
              <div className="text-4xl font-bold mb-4">¥0<span className="text-lg text-gray-500">/月</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  每天1次生成
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  基础剧本
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  标准格式导出
                </li>
              </ul>
              <Link to="/register" className="btn-secondary w-full">
                免费开始
              </Link>
            </div>

            {/* Standard Plan */}
            <div className="card p-8 border-2 border-primary-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm">最受欢迎</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">标准版</h3>
              <div className="text-4xl font-bold mb-4">¥29<span className="text-lg text-gray-500">/月</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  每天10次生成
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  完整剧本+资产
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  MJ提示词生成
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  优先处理
                </li>
              </ul>
              <Link to="/pricing" className="btn-primary w-full">
                立即升级
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="card p-8">
              <h3 className="text-xl font-semibold mb-2">专业版</h3>
              <div className="text-4xl font-bold mb-4">¥99<span className="text-lg text-gray-500">/月</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  无限次生成
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  全部功能
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  API接入
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  专属客服
                </li>
              </ul>
              <Link to="/pricing" className="btn-secondary w-full">
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            准备好开始创作了吗？
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            加入数千名创作者的行列，用AI加速你的短剧创作
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create" className="btn-primary text-lg px-8 py-4">
              <Sparkles className="w-5 h-5 mr-2" />
              免费开始创作
            </Link>
            <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
              查看价格方案
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Film className="w-6 h-6 text-primary-400" />
                <span className="text-xl font-bold text-white">影刃AI</span>
              </div>
              <p className="text-sm text-gray-400">
                专业级AI短剧剧本生成工具
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/create" className="hover:text-white">开始创作</Link></li>
                <li><Link to="/pricing" className="hover:text-white">价格方案</Link></li>
                <li><Link to="/" className="hover:text-white">使用示例</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">帮助中心</a></li>
                <li><a href="#" className="hover:text-white">联系我们</a></li>
                <li><a href="#" className="hover:text-white">API文档</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">法律</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">服务条款</a></li>
                <li><a href="#" className="hover:text-white">隐私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2026 影刃AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
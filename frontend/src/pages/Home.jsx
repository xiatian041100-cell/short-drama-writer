import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Film, Sparkles, Zap, Palette, ArrowRight, Play, Star, Check,
  TrendingUp, Users, Clock, Shield, Download, MessageSquare,
  ChevronRight, Quote
} from 'lucide-react'

function Home() {
  const [examplePrompt, setExamplePrompt] = useState('')
  const [isVisible, setIsVisible] = useState({})

  const examples = [
    '穷小子意外获得超能力，开始逆袭人生',
    '现代女医生穿越古代，用医术改变命运',
    '失忆的霸道总裁爱上平凡女孩',
    '普通大学生获得系统，开启修仙之路',
  ]

  const features = [
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: 'AI智能生成',
      description: '基于GPT-4/Claude等大模型，一句话生成80集完整剧本，包含详细分集大纲',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: <Palette className="w-7 h-7" />,
      title: '视觉资产生成',
      description: '自动生成Midjourney专业级提示词，包含角色设定、场景描述、服装道具',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: '付费卡点设计',
      description: '专业设计的付费转化点，精准把握观众心理，提高短剧商业价值',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Film className="w-7 h-7" />,
      title: '多种类型风格',
      description: '支持爽剧、悬疑、喜剧、虐心、甜宠等多种短剧类型，满足不同需求',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Download className="w-7 h-7" />,
      title: '多格式导出',
      description: '支持PDF、Word、TXT等多种格式导出，方便后续编辑和拍摄使用',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: '版权完全归属',
      description: '生成的剧本版权归你所有，可自由商用，无需担心版权纠纷',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  const stats = [
    { number: '50,000+', label: '剧本已生成' },
    { number: '10,000+', label: '活跃创作者' },
    { number: '98%', label: '满意度' },
    { number: '3分钟', label: '平均生成时间' },
  ]

  const testimonials = [
    {
      text: '以前写一个80集剧本需要一周，现在3分钟就搞定了。而且生成的付费卡点非常精准，我们的短剧转化率提升了40%！',
      author: '张导演',
      role: '短剧制作公司创始人',
      avatar: 'Z'
    },
    {
      text: '作为独立编剧，这个工具帮我大大提高了效率。视觉资产的生成功能太棒了，直接给美术组参考。',
      author: '李编剧',
      role: '自由编剧',
      avatar: 'L'
    },
    {
      text: '我们MCN机构每天需要大量剧本，这个工具完美解决了我们的需求。API接入后更是实现了自动化生产。',
      author: '王运营',
      role: 'MCN机构内容总监',
      avatar: 'W'
    }
  ]

  const steps = [
    { 
      step: 1, 
      title: '输入创意', 
      desc: '一句话描述你的想法，选择剧本类型和风格',
      icon: <MessageSquare className="w-6 h-6" />
    },
    { 
      step: 2, 
      title: 'AI生成', 
      desc: '2-3分钟生成完整80集剧本、视觉资产和付费卡点',
      icon: <Zap className="w-6 h-6" />
    },
    { 
      step: 3, 
      title: '导出使用', 
      desc: '下载PDF或Word格式，直接用于拍摄或二次创作',
      icon: <Download className="w-6 h-6" />
    },
  ]

  const faqs = [
    {
      question: '生成一次剧本需要多长时间？',
      answer: '通常需要2-5分钟。系统会同时生成80集完整剧本、Midjourney提示词和付费卡点设计。专业版用户享受最高优先级处理，速度更快。'
    },
    {
      question: '生成的剧本质量如何？',
      answer: '我们的AI基于专业编剧智能体训练，生成的剧本包含完整的人物设定、情节发展、高潮设计和付费卡点。已有超过1000部短剧使用我们的剧本成功上线。'
    },
    {
      question: '可以免费试用吗？',
      answer: '是的！免费版每天可以生成1次30集剧本，让你充分体验产品功能。无需信用卡，永久免费。升级付费版后可解锁完整功能。'
    },
    {
      question: '生成的剧本可以商用吗？',
      answer: '可以。所有生成的剧本版权归你所有，可以自由用于商业项目。我们不对你的创作主张任何权利，你可以放心使用。'
    },
  ]

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }))
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg min-h-screen flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-violet-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 glass rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">AI驱动的短剧创作革命</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                一句话生成
                <span className="gradient-text block mt-2">80集完整短剧剧本</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                基于专业编剧智能体，将你的想法转化为包含付费卡点、视觉资产的完整短剧剧本。已有 <span className="font-semibold text-violet-600">50,000+</span> 剧本成功生成。
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  免费开始创作
                </Link>
                <button className="btn-secondary text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  观看演示
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>无需信用卡</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>每天免费1次</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>版权完全归属</span>
                </div>
              </div>
            </div>

            {/* Right content - Interactive Demo */}
            <div className="relative">
              <div className="card p-6 shadow-2xl shadow-violet-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-sm text-gray-400">AI剧本生成器</span>
                </div>
                
                <textarea
                  value={examplePrompt}
                  onChange={(e) => setExamplePrompt(e.target.value)}
                  placeholder="输入你的想法，例如：一个穷小子意外获得超能力，开始逆袭人生..."
                  className="textarea text-base mb-4 min-h-[120px]"
                />
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setExamplePrompt(ex)}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-violet-100 hover:text-violet-700 rounded-full text-gray-600 transition-colors"
                    >
                      {ex.slice(0, 12)}...
                    </button>
                  ))}
                </div>
                
                <button className="btn-primary w-full py-3">
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始生成剧本
                </button>

                {/* Preview card */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      剧
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">《逆袭人生》</p>
      <p className="text-sm text-gray-500">80集完整剧本</p>
    </div>
                    <span className="ml-auto badge-success">已完成</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 2分35秒
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" /> PDF/Word
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -bottom-4 -left-4 glass rounded-xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">转化率提升</p>
                    <p className="text-lg font-bold text-green-600">+40%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <p className="stat-number">{stat.number}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section gradient-bg" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-header">
            <span className="badge-primary mb-4">核心功能</span>
            <h2 className="section-title">
              一站式短剧创作
              <span className="gradient-text">解决方案</span>
            </h2>
            <p className="section-subtitle">
              从创意到成品，AI全程辅助，让创作效率提升100倍
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="feature-card group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-header">
            <span className="badge-primary mb-4">使用流程</span>
            <h2 className="section-title">三步生成专业剧本</h2>
            <p className="section-subtitle">简单快捷，无需任何编剧经验</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="card p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white mx-auto mb-6">
                    {step.icon}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-header">
            <span className="badge-primary mb-4">用户评价</span>
            <h2 className="section-title">创作者们怎么说</h2>
            <p className="section-subtitle">来自真实用户的反馈</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="testimonial-card">
                <Quote className="w-8 h-8 text-violet-200 mb-4" />
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-header">
            <span className="badge-primary mb-4">常见问题</span>
            <h2 className="section-title">还有疑问？</h2>
            <p className="section-subtitle">我们为你解答</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            准备好开始创作了吗？
          </h2>
          <p className="text-xl text-white/80 mb-8">
            立即加入 10,000+ 创作者的行列
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-violet-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-xl">
              <Sparkles className="w-5 h-5 mr-2" />
              免费开始创作
            </Link>
            <Link to="/pricing" className="btn bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 text-lg px-8 py-4">
              查看定价方案
            </Link>
          </div>
          <p className="mt-6 text-white/60 text-sm">
            无需信用卡 · 每天免费1次 · 随时取消
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home

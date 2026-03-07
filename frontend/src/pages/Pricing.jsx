import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles, Zap, Crown, Building2 } from 'lucide-react'

function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      name: '免费版',
      icon: <Sparkles className="w-6 h-6" />,
      price: { monthly: 0, yearly: 0 },
      description: '适合个人用户体验',
      features: [
        '每天1次生成',
        '基础剧本内容',
        '标准格式导出',
        '社区支持',
      ],
      notIncluded: [
        'MJ提示词生成',
        '付费卡点设计',
        '优先处理',
        'API接入',
      ],
      cta: '免费开始',
      href: '/register',
      popular: false,
    },
    {
      name: '标准版',
      icon: <Zap className="w-6 h-6" />,
      price: { monthly: 29, yearly: 290 },
      description: '适合内容创作者',
      features: [
        '每天10次生成',
        '完整80集剧本',
        'MJ提示词生成',
        '付费卡点设计',
        '优先处理队列',
        '邮件支持',
      ],
      notIncluded: [
        'API接入',
        '专属客服',
      ],
      cta: '立即升级',
      href: '/register',
      popular: true,
    },
    {
      name: '专业版',
      icon: <Crown className="w-6 h-6" />,
      price: { monthly: 99, yearly: 990 },
      description: '适合专业团队',
      features: [
        '无限次生成',
        '全部高级功能',
        'MJ提示词生成',
        '付费卡点设计',
        '最高优先级',
        'API接入',
        '专属客服',
        '定制需求',
      ],
      notIncluded: [],
      cta: '立即升级',
      href: '/register',
      popular: false,
    },
  ]

  const faqs = [
    {
      question: '生成一次剧本需要多长时间？',
      answer: '通常需要2-5分钟。系统会同时生成80集完整剧本、Midjourney提示词和付费卡点设计。'
    },
    {
      question: '可以免费试用吗？',
      answer: '是的！免费版每天可以生成1次完整剧本，让你充分体验产品功能。'
    },
    {
      question: '生成的剧本可以商用吗？',
      answer: '可以。所有生成的剧本版权归你所有，可以自由用于商业项目。'
    },
    {
      question: '如何取消订阅？',
      answer: '你可以随时在账户设置中取消订阅，取消后仍可使用到当前计费周期结束。'
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们支持支付宝、微信支付、信用卡、PayPal等多种支付方式。'
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            简单透明的<span className="gradient-text">价格方案</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            选择适合你的方案，开始创作专业级短剧剧本
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              年付 <span className="text-green-600">省20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-8 relative ${
                plan.popular ? 'border-2 border-primary-500 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    最受欢迎
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  plan.popular ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-2xl font-bold">¥</span>
                  <span className="text-5xl font-bold">{plan.price[billingCycle]}</span>
                  <span className="text-gray-500 ml-2">/{billingCycle === 'monthly' ? '月' : '年'}</span>
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    相当于 ¥{Math.round(plan.price.yearly / 12)}/月
                  </p>
                )}
              </div>

              <Link
                to={plan.href}
                className={`block w-full text-center py-3 rounded-lg font-medium transition-colors mb-6 ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900">包含功能：</p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center text-sm">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 my-3"></div>
                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-12 card p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">企业版</h3>
                <p className="text-gray-600">为大型团队定制，包含私有化部署和专属功能</p>
              </div>
            </div>
            <Link to="/contact" className="btn-secondary whitespace-nowrap">
              联系销售
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="card p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-gray-600 mb-8">立即注册，免费体验AI剧本生成的魅力</p>
          <Link to="/register" className="btn-primary text-lg px-8 py-4">
            <Sparkles className="w-5 h-5 mr-2" />
            免费开始创作
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Pricing
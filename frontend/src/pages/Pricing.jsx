import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Zap, Crown, Building2, Loader2 } from 'lucide-react'
import { paymentService } from '../services/payment'
import { useAuth } from '../hooks/useAuth'

function Pricing() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)

  // 获取当前订阅状态
  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptionStatus()
    }
  }, [isAuthenticated])

  const loadSubscriptionStatus = async () => {
    try {
      const status = await paymentService.getSubscriptionStatus()
      setCurrentPlan(status.plan)
      setSubscriptionStatus(status)
    } catch (error) {
      console.error('Failed to load subscription status:', error)
    }
  }

  // 处理支付
  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/register')
      return
    }

    if (plan === 'free') {
      navigate('/dashboard')
      return
    }

    // 如果已经是该计划，跳转到管理页面
    if (currentPlan === plan && subscriptionStatus?.status === 'active') {
      try {
        setLoading('portal')
        const { url } = await paymentService.getCustomerPortal()
        window.location.href = url
      } catch (error) {
        alert('打开管理页面失败，请稍后重试')
      } finally {
        setLoading(null)
      }
      return
    }

    // 创建支付会话
    try {
      setLoading(plan)
      const interval = billingCycle === 'yearly' ? 'year' : 'month'
      const { url } = await paymentService.createCheckoutSession(plan, interval)
      window.location.href = url
    } catch (error) {
      alert('创建支付失败，请稍后重试')
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  // 新商业模式定价
  const plans = [
    {
      name: '免费版',
      planId: 'free',
      icon: <Sparkles className="w-6 h-6" />,
      price: { monthly: 0, yearly: 0 },
      description: '适合个人用户体验',
      features: [
        '每天 1 次生成',
        '30集基础剧本',
        '标准类型模板',
        '带水印导出',
        '社区支持',
      ],
      notIncluded: [
        'MJ提示词生成',
        '付费卡点设计',
        'API接入',
        '团队协作',
      ],
      cta: '免费开始',
      popular: false,
    },
    {
      name: '标准版',
      planId: 'standard',
      icon: <Zap className="w-6 h-6" />,
      price: { monthly: 49, yearly: 399 },
      description: '适合内容创作者',
      features: [
        '每天 20 次生成',
        '完整80集剧本',
        'MJ提示词生成',
        '付费卡点设计',
        '无水印导出',
        '优先处理队列',
        '邮件支持',
      ],
      notIncluded: [
        'API接入',
        '团队协作',
        '专属客服',
      ],
      cta: '立即升级',
      popular: true,
    },
    {
      name: '专业版',
      planId: 'pro',
      icon: <Crown className="w-6 h-6" />,
      price: { monthly: 199, yearly: 1599 },
      description: '适合专业团队',
      features: [
        '无限次生成',
        '完整80集剧本',
        'MJ提示词生成',
        '付费卡点设计',
        'API接入',
        '团队协作（5人）',
        '最高优先级',
        '专属客服',
      ],
      notIncluded: [],
      cta: '立即升级',
      popular: false,
    },
  ]

  // 计算节省金额
  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.price.yearly > 0) {
      const monthlyCost = plan.price.monthly * 12
      const yearlyCost = plan.price.yearly
      const savings = monthlyCost - yearlyCost
      const percent = Math.round((savings / monthlyCost) * 100)
      return { amount: savings, percent }
    }
    return null
  }

  const faqs = [
    {
      question: '生成一次剧本需要多长时间？',
      answer: '通常需要2-5分钟。系统会同时生成80集完整剧本、Midjourney提示词和付费卡点设计。专业版用户享受最高优先级处理。'
    },
    {
      question: '可以免费试用吗？',
      answer: '是的！免费版每天可以生成1次30集剧本，让你充分体验产品功能。无需信用卡，永久免费。'
    },
    {
      question: '生成的剧本可以商用吗？',
      answer: '可以。所有生成的剧本版权归你所有，可以自由用于商业项目。我们不对你的创作主张任何权利。'
    },
    {
      question: '如何取消订阅？',
      answer: '你可以随时在账户设置中取消订阅，取消后仍可使用到当前计费周期结束。我们不会收取任何取消费用。'
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们支持支付宝、微信支付、信用卡、PayPal等多种支付方式。所有支付都经过SSL加密，安全可靠。'
    },
    {
      question: '年付有什么优惠？',
      answer: '选择年付可以享受大幅优惠：标准版省20%（省¥189），专业版省33%（省¥789）。推荐选择年付，性价比最高。'
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
          
          {/* 当前计划提示 */}
          {isAuthenticated && currentPlan !== 'free' && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm text-gray-600">当前计划：</span>
              <span className="text-sm font-semibold text-primary-600 capitalize">
                {currentPlan === 'standard' ? '标准版' : currentPlan === 'pro' ? '专业版' : '企业版'}
              </span>
              {subscriptionStatus?.cancelAtPeriodEnd && (
                <span className="text-sm text-orange-600">（即将到期）</span>
              )}
            </div>
          )}
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
              年付 
              <span className="ml-1 text-green-600 font-semibold">最高省33%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const savings = getSavings(plan)
            const isCurrentPlan = currentPlan === plan.planId
            const isLoading = loading === plan.planId
            
            return (
              <div
                key={plan.name}
                className={`card p-8 relative ${
                  plan.popular ? 'border-2 border-primary-500 shadow-xl scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      最受欢迎
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      当前计划
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
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        相当于 ¥{Math.round(plan.price.yearly / 12)}/月
                      </p>
                      {savings && (
                        <p className="text-sm text-green-600 font-medium">
                          年付省 ¥{savings.amount}（{savings.percent}%）
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.planId)}
                  disabled={isLoading || loading === 'portal'}
                  className={`block w-full text-center py-3 rounded-lg font-medium transition-colors mb-6 ${
                    plan.popular
                      ? 'btn-primary'
                      : isCurrentPlan 
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'btn-secondary'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      处理中...
                    </span>
                  ) : isCurrentPlan ? (
                    subscriptionStatus?.cancelAtPeriodEnd ? '重新订阅' : '管理订阅'
                  ) : (
                    plan.cta
                  )}
                </button>

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
            )
          })}
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
                <ul className="mt-2 text-sm text-gray-500 space-y-1">
                  <li>• 私有化部署</li>
                  <li>• 定制AI模型训练</li>
                  <li>• 无限团队成员</li>
                  <li>• SLA保障</li>
                </ul>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-3xl font-bold mb-2">定制</p>
              <button 
                onClick={() => window.location.href = 'mailto:sales@shortdrama.ai'}
                className="btn-secondary whitespace-nowrap"
              >
                联系销售
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">SSL安全支付</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">7天无理由退款</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">发票支持</span>
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
          <button 
            onClick={() => handleSubscribe('free')}
            className="btn-primary text-lg px-8 py-4"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            免费开始创作
          </button>
          <p className="mt-4 text-sm text-gray-500">无需信用卡，永久免费</p>
        </div>
      </div>
    </div>
  )
}

export default Pricing

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

function Payment() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('alipay')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const plans = [
    {
      id: 'standard',
      name: '标准版',
      icon: <Zap className="w-6 h-6" />,
      price: 29,
      period: '月',
      description: '适合内容创作者',
      features: [
        '每天10次生成',
        '完整80集剧本',
        'MJ提示词生成',
        '付费卡点设计',
        '优先处理队列',
        '邮件支持',
      ],
      popular: true,
    },
    {
      id: 'pro',
      name: '专业版',
      icon: <Crown className="w-6 h-6" />,
      price: 99,
      period: '月',
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
      popular: false,
    },
    {
      id: 'enterprise',
      name: '企业版',
      icon: <Building2 className="w-6 h-6" />,
      price: null,
      period: '定制',
      description: '为大型团队定制',
      features: [
        '私有化部署',
        '定制功能开发',
        '专属技术支持',
        'SLA保障',
        '培训服务',
      ],
      popular: false,
      custom: true,
    },
  ]

  const paymentMethods = [
    { id: 'alipay', name: '支付宝', icon: '💙' },
    { id: 'wechat', name: '微信支付', icon: '💚' },
    { id: 'stripe', name: '信用卡', icon: '💳' },
  ]

  const handlePayment = async () => {
    if (selectedPlan === 'enterprise') {
      // 企业版联系销售
      window.location.href = 'mailto:sales@yingren.ai'
      return
    }

    setLoading(true)
    setError('')

    try {
      // 模拟支付流程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 实际应该调用支付API
      // const response = await api.post('/payment/create', {
      //   plan: selectedPlan,
      //   method: paymentMethod
      // })

      setSuccess(true)
      
      // 3秒后跳转到仪表盘
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (err) {
      setError('支付失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 gradient-bg">
        <div className="card p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">支付成功！</h2>
          <p className="text-gray-600 mb-4">
            你已升级到 {selectedPlanData.name}，现在可以享受所有会员功能了
          </p>
          <p className="text-sm text-gray-500">3秒后自动跳转到仪表盘...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 gradient-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">选择你的会员方案</h1>
          <p className="text-gray-600">解锁更多功能，提升创作效率</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`card p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-2 border-primary-500 shadow-lg'
                  : 'hover:shadow-md'
              } ${plan.popular ? 'relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs">
                    最受欢迎
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  selectedPlan === plan.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                {plan.custom ? (
                  <div className="text-2xl font-bold">定制</div>
                ) : (
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl">¥</span>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                selectedPlan === plan.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              }`}>
                {selectedPlan === plan.id && (
                  <Check className="w-4 h-4 text-white mx-auto mt-0.5" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        {!selectedPlanData?.custom && (
          <div className="card p-6 max-w-2xl mx-auto mb-6">
            <h3 className="text-lg font-semibold mb-4">选择支付方式</h3>
            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{method.icon}</span>
                  <span className="text-sm">{method.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary & Pay */}
        <div className="card p-6 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">已选择</span>
            <span className="font-semibold">{selectedPlanData.name}</span>
          </div>
          
          {!selectedPlanData?.custom && (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">价格</span>
                <span className="text-2xl font-bold">¥{selectedPlanData.price}/{selectedPlanData.period}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">总计</span>
                  <span className="text-3xl font-bold text-primary-600">¥{selectedPlanData.price}</span>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : selectedPlanData?.custom ? (
              '联系销售'
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                立即支付
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            支付即表示你同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  )
}

export default Payment
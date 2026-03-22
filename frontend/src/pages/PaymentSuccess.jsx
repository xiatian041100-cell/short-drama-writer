import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { paymentService } from '../services/payment'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [error, setError] = useState('')
  const [plan, setPlan] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setStatus('error')
      setError('无效的支付会话')
    }
  }, [searchParams])

  const verifyPayment = async (sessionId) => {
    try {
      const result = await paymentService.verifyPayment(sessionId)
      
      if (result.status === 'paid') {
        setStatus('success')
        setPlan(result.plan)
      } else {
        setStatus('error')
        setError('支付尚未完成')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      setStatus('error')
      setError('验证支付状态失败')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">正在确认支付...</h2>
          <p className="text-gray-600 mt-2">请稍候，我们正在处理你的订单</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">支付确认失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link to="/pricing" className="btn-primary block w-full">
              返回定价页面
            </Link>
            <Link to="/dashboard" className="btn-secondary block w-full">
              前往仪表盘
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const planNames = {
    standard: '标准版',
    pro: '专业版',
    enterprise: '企业版'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          支付成功！
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          欢迎加入 <span className="font-semibold text-primary-600">{planNames[plan] || '专业版'}</span>
        </p>
        
        <p className="text-gray-500 mb-8">
          你的订阅已激活，现在可以开始使用所有高级功能了
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">你已解锁的功能：</h3>
          <ul className="space-y-2 text-gray-600">
            {plan === 'standard' && (
              <>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  每天 20 次生成
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  完整 80 集剧本
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  MJ 提示词生成
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  付费卡点设计
                </li>
              </>
            )}
            {plan === 'pro' && (
              <>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  无限次生成
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  API 接入
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  团队协作（5人）
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  专属客服支持
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <Link to="/dashboard" className="btn-primary block w-full text-lg py-4">
            开始创作剧本
          </Link>
          <Link to="/dashboard/settings" className="btn-secondary block w-full">
            查看订阅详情
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          收据已发送至你的邮箱。如有问题，请联系 support@shortdrama.ai
        </p>
      </div>
    </div>
  )
}

export default PaymentSuccess

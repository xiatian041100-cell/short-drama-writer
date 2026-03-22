import { Link } from 'react-router-dom'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'

function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          支付已取消
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          你的订单未完成支付
        </p>
        
        <p className="text-gray-500 mb-8">
          不用担心，你的账户没有任何扣款。如果你遇到了问题，可以查看下方的帮助信息或联系客服。
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            可能的原因：
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>• 支付过程中断或超时</li>
            <li>  支付方式余额不足</li>
            <li>• 银行或支付平台风控拦截</li>
            <li>• 主动取消了支付</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link to="/pricing" className="btn-primary block w-full text-lg py-4">
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            重新选择方案
          </Link>
          <a 
            href="mailto:support@shortdrama.ai" 
            className="btn-secondary block w-full"
          >
            联系客服帮助
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            或者，你可以先免费体验：
          </p>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
            使用免费版 →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel

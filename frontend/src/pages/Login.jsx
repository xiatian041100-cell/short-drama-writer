import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import api from '../services/api'

function Login({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 调用真实API
      const response = await api.post('/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      
      // 根据用户角色跳转
      if (response.data.user.isAdmin) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  // 快速登录管理员账号（开发测试用）
  const handleAdminLogin = async () => {
    setLoading(true)
    try {
      // 模拟管理员登录
      setTimeout(() => {
        setUser({
          id: 'admin',
          username: '管理员',
          email: 'admin@yingren.ai',
          isAdmin: true,
          membership: { type: 'pro', dailyUsage: 0 }
        })
        localStorage.setItem('token', 'admin-token')
        navigate('/admin')
      }, 500)
    } catch (err) {
      setError('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text">欢迎回来</h2>
            <p className="mt-2 text-gray-600">登录你的影刃AI账户</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-600">记住我</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
                忘记密码？
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  登录
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* 管理员快速入口 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleAdminLogin}
              className="w-full btn-secondary flex items-center justify-center"
            >
              <Shield className="w-5 h-5 mr-2" />
              管理员入口
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账户？{' '}
              <a href="#/register" className="text-primary-600 hover:text-primary-500 font-medium">
                免费注册
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
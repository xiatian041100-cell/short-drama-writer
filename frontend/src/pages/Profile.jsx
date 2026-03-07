import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Crown, 
  Calendar, 
  FileText, 
  CreditCard,
  Edit3,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  Lock
} from 'lucide-react'
import api from '../services/api'

function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  // 用户信息
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || ''
  })
  
  // 密码修改
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 会员信息
  const [membership, setMembership] = useState({
    type: user?.membership?.type || 'free',
    expiresAt: user?.membership?.expiresAt,
    dailyUsage: user?.membership?.dailyUsage || 0,
    dailyLimit: user?.membership?.type === 'free' ? 1 : user?.membership?.type === 'standard' ? 10 : '无限'
  })
  
  // 统计数据
  const [stats, setStats] = useState({
    totalScripts: 0,
    totalGenerations: 0,
    joinedAt: '2024-01-01'
  })
  
  // 订单历史
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchUserStats()
    fetchOrders()
  }, [])

  const fetchUserStats = async () => {
    try {
      // const response = await api.get('/users/stats')
      // setStats(response.data)
      // 模拟数据
      setStats({
        totalScripts: 12,
        totalGenerations: 45,
        joinedAt: '2024-01-15'
      })
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      // const response = await api.get('/users/orders')
      // setOrders(response.data)
      // 模拟数据
      setOrders([
        {
          id: 'ORD001',
          plan: '标准版',
          amount: 29,
          status: 'completed',
          createdAt: '2024-02-01',
          period: '1个月'
        }
      ])
    } catch (error) {
      console.error('获取订单失败:', error)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      // await api.put('/users/profile', formData)
      setMessage({ type: 'success', text: '个人信息已更新' })
    } catch (error) {
      setMessage({ type: 'error', text: '更新失败' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' })
      setLoading(false)
      return
    }
    
    try {
      // await api.put('/users/password', passwordData)
      setMessage({ type: 'success', text: '密码已修改' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: '密码修改失败' })
    } finally {
      setLoading(false)
    }
  }

  const getMembershipBadge = (type) => {
    const badges = {
      free: { label: '免费版', color: 'bg-gray-100 text-gray-600' },
      standard: { label: '标准版', color: 'bg-primary-100 text-primary-700' },
      pro: { label: '专业版', color: 'bg-accent-100 text-accent-700' },
      enterprise: { label: '企业版', color: 'bg-yellow-100 text-yellow-700' }
    }
    return badges[type] || badges.free
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">个人中心</h1>
        <p className="text-gray-600">管理你的账户信息和会员状态</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* User Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-3xl">
            {formData.avatar ? (
              <img src={formData.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold">{formData.username}</h2>
              <span className={`px-2 py-1 rounded-full text-xs ${getMembershipBadge(membership.type).color}`}>
                {getMembershipBadge(membership.type).label}
              </span>
            </div>
            <p className="text-gray-600">{formData.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              加入时间：{new Date(stats.joinedAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <Link to="/pricing" className="btn-primary">
            <Crown className="w-4 h-4 mr-2" />
            升级会员
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{stats.totalScripts}</p>
          <p className="text-sm text-gray-600">剧本总数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-accent-600">{stats.totalGenerations}</p>
          <p className="text-sm text-gray-600">生成次数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{membership.dailyLimit - membership.dailyUsage}</p>
          <p className="text-sm text-gray-600">今日剩余</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            个人信息
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4 mr-2" />
            修改密码
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            订单记录
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">编辑个人信息</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="input bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">邮箱不可修改</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                个人简介
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="textarea"
                rows={3}
                placeholder="介绍一下你自己..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              保存修改
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">修改密码</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                当前密码
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新密码
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认新密码
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              修改密码
            </button>
          </form>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">订单记录</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无订单记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.plan}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status === 'completed' ? '已完成' : '处理中'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      订单号：{order.id} • {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">¥{order.amount}</p>
                    <p className="text-sm text-gray-500">{order.period}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile
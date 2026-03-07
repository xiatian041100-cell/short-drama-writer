import { useState, useEffect } from 'react'
import { 
  Shield, 
  Key, 
  Users, 
  FileText, 
  Save, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'

function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('prompts')
  const [promptContent, setPromptContent] = useState('')
  const [promptVersion, setPromptVersion] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScripts: 0,
    todayGenerations: 0,
    activeUsers: 0
  })
  const [showPrompt, setShowPrompt] = useState(false)

  // 加载智能体指令
  useEffect(() => {
    // 从桌面文件读取指令
    fetchPromptFromFile()
    fetchStats()
  }, [])

  const fetchPromptFromFile = async () => {
    try {
      // 这里应该调用API获取当前激活的指令
      // 模拟从文件读取
      setPromptContent(`## 📋 「影刃」编剧搭档 v3.2

# 角色
你是「影刃」——一位集顶级编剧、游戏系统架构师、叙事心理学家、
视觉资产设计师于一身的万能编剧搭档...

[完整指令内容...]`)
      setPromptVersion('v3.2')
    } catch (error) {
      console.error('加载指令失败:', error)
    }
  }

  const fetchStats = async () => {
    // 模拟统计数据
    setStats({
      totalUsers: 1234,
      totalScripts: 5678,
      todayGenerations: 89,
      activeUsers: 456
    })
  }

  const handleSavePrompt = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // 调用API保存新版本的指令
      // await adminAPI.createPromptVersion({
      //   version: promptVersion,
      //   content: promptContent
      // })

      setTimeout(() => {
        setMessage({ type: 'success', text: '指令已保存并加密存储' })
        setLoading(false)
      }, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败: ' + error.message })
      setLoading(false)
    }
  }

  const handleActivatePrompt = async () => {
    setLoading(true)
    try {
      // await adminAPI.activatePromptVersion(versionId)
      setTimeout(() => {
        setMessage({ type: 'success', text: '新版本已激活' })
        setLoading(false)
      }, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: '激活失败' })
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">管理后台</h1>
        </div>
        <p className="text-gray-600">管理智能体指令、查看系统统计</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">总用户数</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">总剧本数</p>
              <p className="text-3xl font-bold">{stats.totalScripts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">今日生成</p>
              <p className="text-3xl font-bold">{stats.todayGenerations}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">活跃用户</p>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'prompts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="w-4 h-4 mr-2" />
            智能体指令
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            用户管理
          </button>
        </nav>
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

      {/* Tab Content */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">智能体指令管理</h3>
                <p className="text-sm text-gray-600">编辑并更新AI剧本生成智能体的系统指令</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">当前版本:</span>
                <input
                  type="text"
                  value={promptVersion}
                  onChange={(e) => setPromptVersion(e.target.value)}
                  className="input w-24 text-sm py-1"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">指令内容</label>
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
                >
                  {showPrompt ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showPrompt ? '隐藏内容' : '显示内容'}
                </button>
              </div>
              <textarea
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                className="textarea font-mono text-sm"
                rows={20}
                placeholder="输入智能体指令..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSavePrompt}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                保存新版本
              </button>
              <button
                onClick={handleActivatePrompt}
                disabled={loading}
                className="btn-accent"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                激活此版本
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">安全提示</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 指令内容将使用 AES-256-GCM 加密存储</li>
                <li>• 只有激活的版本会被用于剧本生成</li>
                <li>• 历史版本会被保留，可随时回滚</li>
                <li>• 指令内容不会传输到前端，仅在服务端解密使用</li>
              </ul>
            </div>
          </div>

          {/* Version History */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">版本历史</h3>
            <div className="space-y-3">
              {[
                { version: 'v3.2', date: '2026-03-07', status: 'active', author: 'Admin' },
                { version: 'v3.1', date: '2026-03-01', status: 'archived', author: 'Admin' },
                { version: 'v3.0', date: '2026-02-15', status: 'archived', author: 'Admin' },
              ].map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{v.version}</span>
                    <span className="text-sm text-gray-500">{v.date}</span>
                    <span className="text-sm text-gray-500">by {v.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.status === 'active' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        当前激活
                      </span>
                    ) : (
                      <button className="text-sm text-primary-600 hover:text-primary-500">
                        回滚到此版本
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">用户管理</h3>
          <p className="text-gray-600">用户管理功能开发中...</p>
        </div>
      )}
    </div>
  )
}

export default Admin
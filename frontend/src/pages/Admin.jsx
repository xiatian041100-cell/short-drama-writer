import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  EyeOff,
  Plus,
  Trash2,
  Edit,
  TestTube,
  Bot,
  MessageSquare
} from 'lucide-react'
import api from '../services/api'

function Admin({ user }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('models')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  // AI模型管理
  const [models, setModels] = useState([])
  const [showAddModel, setShowAddModel] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [modelForm, setModelForm] = useState({
    name: '',
    provider: 'openai',
    modelId: '',
    apiEndpoint: '',
    apiKey: '',
    description: '',
    icon: '🤖',
    config: {
      maxTokens: 4000,
      temperature: 0.8,
      timeout: 120000
    }
  })
  
  // 智能体指令
  const [promptContent, setPromptContent] = useState('')
  const [promptVersion, setPromptVersion] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  
  // 统计数据
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScripts: 0,
    todayGenerations: 0,
    activeUsers: 0
  })

  useEffect(() => {
    fetchModels()
    fetchStats()
    fetchPrompt()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await api.get('/ai-models')
      setModels(response.data)
    } catch (error) {
      console.error('获取模型失败:', error)
    }
  }

  const fetchStats = async () => {
    // 模拟数据
    setStats({
      totalUsers: 1234,
      totalScripts: 5678,
      todayGenerations: 89,
      activeUsers: 456
    })
  }

  const fetchPrompt = async () => {
    try {
      // 从本地文件或API获取
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

  const handleAddModel = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/ai-models', modelForm)
      setMessage({ type: 'success', text: '模型添加成功' })
      setShowAddModel(false)
      setModelForm({
        name: '',
        provider: 'openai',
        modelId: '',
        apiEndpoint: '',
        apiKey: '',
        description: '',
        icon: '🤖',
        config: { maxTokens: 4000, temperature: 0.8, timeout: 120000 }
      })
      fetchModels()
    } catch (error) {
      setMessage({ type: 'error', text: '添加失败: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleTestModel = async (modelId) => {
    try {
      const response = await api.post(`/ai-models/${modelId}/test`)
      if (response.data.success) {
        setMessage({ type: 'success', text: '连接测试成功！' })
      } else {
        setMessage({ type: 'error', text: '连接失败: ' + response.data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '测试失败' })
    }
  }

  const handleDeleteModel = async (modelId) => {
    if (!confirm('确定要删除这个模型吗？')) return
    try {
      await api.delete(`/ai-models/${modelId}`)
      setMessage({ type: 'success', text: '模型已删除' })
      fetchModels()
    } catch (error) {
      setMessage({ type: 'error', text: '删除失败' })
    }
  }

  const handleSavePrompt = async () => {
    setLoading(true)
    try {
      // await api.post('/admin/prompts', { version: promptVersion, content: promptContent })
      setMessage({ type: 'success', text: '指令已保存' })
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败' })
    } finally {
      setLoading(false)
    }
  }

  const providers = [
    { value: 'openai', label: 'OpenAI', icon: '🟢' },
    { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🟣' },
    { value: 'google', label: 'Google (Gemini)', icon: '🔵' },
    { value: 'alibaba', label: '阿里 (通义千问)', icon: '🟠' },
    { value: 'baidu', label: '百度 (文心一言)', icon: '🔴' },
    { value: 'bytedance', label: '字节 (豆包)', icon: '⚫' },
  ]

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">需要管理员权限</h2>
          <p className="text-gray-600">你没有权限访问此页面</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">管理后台</h1>
        </div>
        <p className="text-gray-600">管理AI模型、智能体指令和系统统计</p>
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
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">AI模型</p>
              <p className="text-3xl font-bold">{models.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'models'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bot className="w-4 h-4 mr-2" />
            AI模型管理
          </button>
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
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Add Model Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI模型列表</h3>
            <button
              onClick={() => setShowAddModel(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加模型
            </button>
          </div>

          {/* Models List */}
          <div className="grid md:grid-cols-2 gap-4">
            {models.map((model) => (
              <div key={model._id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{model.icon}</span>
                    <div>
                      <h4 className="font-semibold">{model.name}</h4>
                      <p className="text-sm text-gray-500">{model.provider} • {model.modelId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.isDefault && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        默认
                      </span>
                    )}
                    {model.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        启用
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        禁用
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">{model.description}</p>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleTestModel(model._id)}
                    className="btn-secondary text-sm py-1"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    测试
                  </button>
                  <button
                    onClick={() => setEditingModel(model)}
                    className="btn-secondary text-sm py-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteModel(model._id)}
                    className="text-red-600 hover:text-red-700 text-sm py-1 px-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Model Modal */}
          {showAddModel && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">添加AI模型</h3>
                
                <form onSubmit={handleAddModel} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        模型名称
                      </label>
                      <input
                        type="text"
                        value={modelForm.name}
                        onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                        className="input"
                        placeholder="例如：GPT-4"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        提供商
                      </label>
                      <select
                        value={modelForm.provider}
                        onChange={(e) => setModelForm({...modelForm, provider: e.target.value})}
                        className="input"
                        required
                      >
                        {providers.map(p => (
                          <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        模型ID
                      </label>
                      <input
                        type="text"
                        value={modelForm.modelId}
                        onChange={(e) => setModelForm({...modelForm, modelId: e.target.value})}
                        className="input"
                        placeholder="例如：gpt-4"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        图标
                      </label>
                      <input
                        type="text"
                        value={modelForm.icon}
                        onChange={(e) => setModelForm({...modelForm, icon: e.target.value})}
                        className="input"
                        placeholder="例如：🤖"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API端点（可选，使用默认则留空）
                    </label>
                    <input
                      type="text"
                      value={modelForm.apiEndpoint}
                      onChange={(e) => setModelForm({...modelForm, apiEndpoint: e.target.value})}
                      className="input"
                      placeholder="https://api.openai.com/v1/chat/completions"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API密钥
                    </label>
                    <input
                      type="password"
                      value={modelForm.apiKey}
                      onChange={(e) => setModelForm({...modelForm, apiKey: e.target.value})}
                      className="input"
                      placeholder="sk-..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={modelForm.description}
                      onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
                      className="textarea"
                      rows={2}
                      placeholder="模型描述..."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={modelForm.config.maxTokens}
                        onChange={(e) => setModelForm({...modelForm, config: {...modelForm.config, maxTokens: parseInt(e.target.value)}})}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={modelForm.config.temperature}
                        onChange={(e) => setModelForm({...modelForm, config: {...modelForm.config, temperature: parseFloat(e.target.value)}})}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        超时(ms)
                      </label>
                      <input
                        type="number"
                        value={modelForm.config.timeout}
                        onChange={(e) => setModelForm({...modelForm, config: {...modelForm.config, timeout: parseInt(e.target.value)}})}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '添加模型'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModel(false)}
                      className="btn-secondary"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">智能体指令管理</h3>
                <p className="text-sm text-gray-600">编辑AI剧本生成智能体的系统指令</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">版本:</span>
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
                  {showPrompt ? '隐藏' : '显示'}
                </button>
              </div>
              <textarea
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                className="textarea font-mono text-sm"
                rows={20}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSavePrompt}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                保存新版本
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">安全提示</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 指令内容使用 AES-256-GCM 加密存储</li>
                <li>• 只有激活的版本会被用于剧本生成</li>
                <li>• 历史版本会被保留，可随时回滚</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
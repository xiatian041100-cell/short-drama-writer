import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Film, 
  Palette, 
  BookOpen,
  Clock,
  MessageSquare,
  Send,
  Bot,
  User,
  ChevronRight,
  Save,
  Download
} from 'lucide-react'
import api from '../services/api'

function CreateScript({ user }) {
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  
  // 步骤状态
  const [step, setStep] = useState('select-model') // select-model, chat, completed
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // AI模型选择
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)
  
  // 剧本信息
  const [scriptType, setScriptType] = useState('爽剧')
  const [scriptStyle, setScriptStyle] = useState('现代')
  const [originalPrompt, setOriginalPrompt] = useState('')
  
  // 对话会话
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  
  // 生成进度
  const [currentStep, setCurrentStep] = useState('idea')
  const [generatedContent, setGeneratedContent] = useState(null)
  
  // 剧本标题
  const [scriptTitle, setScriptTitle] = useState('')
  
  const types = ['爽剧', '悬疑', '喜剧', '虐心', '穿越', '重生', '系统流']
  const styles = ['现代', '古装', '民国', '科幻', '玄幻', '都市']
  
  const steps = [
    { id: 'idea', label: '创意构思', icon: Sparkles },
    { id: 'outline', label: '大纲生成', icon: BookOpen },
    { id: 'characters', label: '角色设定', icon: User },
    { id: 'episodes', label: '剧本生成', icon: Film },
    { id: 'assets', label: '视觉资产', icon: Palette },
    { id: 'completed', label: '完成', icon: CheckCircle }
  ]

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchModels = async () => {
    try {
      const response = await api.get('/ai-models/available')
      setModels(response.data)
      if (response.data.length > 0) {
        setSelectedModel(response.data[0])
      }
    } catch (error) {
      console.error('获取模型失败:', error)
      // 使用默认模型
      setModels([
        { _id: 'default', name: 'GPT-4', provider: 'openai', icon: '🟢', description: 'OpenAI GPT-4模型' }
      ])
      setSelectedModel({ _id: 'default', name: 'GPT-4', provider: 'openai', icon: '🟢' })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleStartGeneration = async () => {
    if (!selectedModel) {
      setError('请选择一个AI模型')
      return
    }
    if (!originalPrompt.trim()) {
      setError('请输入你的创意')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/generation/start', {
        aiModelId: selectedModel._id,
        prompt: originalPrompt,
        scriptType,
        scriptStyle
      })

      setSessionId(response.data.sessionId)
      setMessages(response.data.messages)
      setCurrentStep(response.data.currentStep)
      setStep('chat')
    } catch (err) {
      setError(err.response?.data?.error || '启动生成失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return

    const userMessage = inputMessage
    setInputMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await api.post(`/generation/${sessionId}/chat`, {
        message: userMessage
      })

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }])
      setCurrentStep(response.data.currentStep)
      setGeneratedContent(response.data.generatedContent)

      // 如果完成了，显示完成界面
      if (response.data.currentStep === 'completed') {
        setStep('completed')
      }
    } catch (err) {
      setError(err.response?.data?.error || '发送消息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!scriptTitle.trim()) {
      setError('请输入剧本标题')
      return
    }

    setLoading(true)
    try {
      const response = await api.post(`/generation/${sessionId}/complete`, {
        title: scriptTitle
      })

      navigate(`/script/${response.data.scriptId}`)
    } catch (err) {
      setError(err.response?.data?.error || '保存剧本失败')
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 步骤一：选择模型和输入创意
  if (step === 'select-model') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">创建新剧本</h1>
          <p className="text-gray-600">选择AI模型，输入你的创意，开始生成80集完整短剧剧本</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* AI模型选择 */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            选择AI模型
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <button
                key={model._id}
                onClick={() => setSelectedModel(model)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedModel?._id === model._id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{model.icon}</span>
                  <div>
                    <p className="font-semibold">{model.name}</p>
                    <p className="text-sm text-gray-500">{model.provider}</p>
                  </div>
                </div>
                {model.description && (
                  <p className="text-sm text-gray-600 mt-2">{model.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 剧本类型和风格 */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">剧本设置</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                剧本类型
              </label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setScriptType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scriptType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时代风格
              </label>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setScriptStyle(style)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scriptStyle === style
                        ? 'bg-accent-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 创意输入 */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">你的创意</h3>
          <textarea
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            className="textarea text-lg"
            rows={4}
            placeholder="例如：一个穷小子意外获得超能力，开始逆袭人生，最终成为商业帝国的主宰..."
          />
          <p className="mt-2 text-sm text-gray-500">
            描述越详细，生成的剧本质量越高。建议包含：主角身份、核心冲突、故事背景
          </p>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={handleStartGeneration}
          disabled={loading}
          className="btn-primary w-full py-4 text-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          {loading ? '启动中...' : '开始创作'}
        </button>
      </div>
    )
  }

  // 步骤二：对话生成
  if (step === 'chat') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">剧本生成中</h1>
              <p className="text-gray-600">与AI对话，一步步完善你的剧本</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedModel?.icon}</span>
              <span className="text-sm text-gray-600">{selectedModel?.name}</span>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  steps.findIndex(step => step.id === currentStep) >= index
                    ? 'text-primary-600'
                    : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    steps.findIndex(step => step.id === currentStep) >= index
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  }`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* 对话区域 */}
        <div className="card p-6 mb-6">
          <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="textarea flex-1"
              rows={2}
              placeholder="输入消息..."
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="btn-primary px-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 生成的内容预览 */}
        {generatedContent && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">生成进度</h3>
            {generatedContent.title && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">剧本标题</p>
                <p className="font-semibold">{generatedContent.title}</p>
              </div>
            )}
            {generatedContent.characters && generatedContent.characters.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">角色数</p>
                <p className="font-semibold">{generatedContent.characters.length} 个</p>
              </div>
            )}
            {generatedContent.episodes && generatedContent.episodes.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">剧集数</p>
                <p className="font-semibold">{generatedContent.episodes.length} 集</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // 步骤三：完成
  if (step === 'completed') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">剧本生成完成！</h2>
          <p className="text-gray-600 mb-6">你的80集短剧剧本已经生成完毕</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              剧本标题
            </label>
            <input
              type="text"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
              className="input text-lg"
              placeholder="输入剧本标题..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="btn-primary flex-1 py-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              保存剧本
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary py-3"
            >
              <Download className="w-5 h-5 mr-2" />
              稍后保存
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default CreateScript
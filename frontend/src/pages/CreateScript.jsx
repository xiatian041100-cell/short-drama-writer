import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, AlertCircle, CheckCircle, Film, Palette, Zap, BookOpen } from 'lucide-react'

function CreateScript({ user }) {
  const [formData, setFormData] = useState({
    prompt: '',
    type: '爽剧',
    style: '现代',
    episodes: 80,
    includeAssets: true
  })
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const types = ['爽剧', '悬疑', '喜剧', '虐心', '穿越', '重生', '系统流']
  const styles = ['现代', '古装', '民国', '科幻', '玄幻', '都市']

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.prompt.trim()) {
      setError('请输入你的想法')
      return
    }

    setLoading(true)
    setError('')
    setProgress(0)

    // 模拟进度
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 1000)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 8000))
      clearInterval(progressInterval)
      setProgress(100)
      
      // 成功后跳转到剧本详情
      setTimeout(() => {
        navigate('/script/1')
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setError('生成失败，请稍后重试')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">创建新剧本</h1>
        <p className="text-gray-600">输入你的想法，AI将为你生成80集完整短剧剧本</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold mb-2">正在生成剧本...</h3>
          <p className="text-gray-600 mb-6">AI正在根据你的创意生成完整剧本和视觉资产</p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className={`p-4 rounded-lg ${progress > 20 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
              <BookOpen className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">分析创意</p>
            </div>
            <div className={`p-4 rounded-lg ${progress > 40 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
              <Film className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">生成大纲</p>
            </div>
            <div className={`p-4 rounded-lg ${progress > 60 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
              <Zap className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">编写剧本</p>
            </div>
            <div className={`p-4 rounded-lg ${progress > 80 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
              <Palette className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">生成资产</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-8">
          {/* Prompt Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              你的想法 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="textarea text-lg"
              rows={4}
              placeholder="例如：一个穷小子意外获得超能力，开始逆袭人生，最终成为商业帝国的主宰..."
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              描述越详细，生成的剧本质量越高。建议包含：主角身份、核心冲突、故事背景
            </p>
          </div>

          {/* Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              剧本类型
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.type === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              时代风格
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFormData({ ...formData, style })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.style === style
                      ? 'bg-accent-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.includeAssets}
                onChange={(e) => setFormData({ ...formData, includeAssets: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
              />
              <span className="ml-3 text-gray-700">
                生成Midjourney视觉资产提示词（角色、场景、道具）
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="btn-primary flex-1 py-4 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              开始生成剧本
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">生成说明</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• 预计生成时间：2-5分钟</li>
                  <li>• 生成内容包括：80集完整剧本 + 付费卡点设计 + MJ提示词</li>
                  <li>• 免费版每天可生成1次，升级会员可获得更多次数</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Templates */}
      {!loading && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">或者从模板开始</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: '霸道总裁', desc: '冷酷总裁爱上平凡女孩的经典套路', type: '爽剧' },
              { title: '穿越重生', desc: '现代人穿越古代，用现代知识改变命运', type: '穿越' },
              { title: '系统流', desc: '获得系统加持，一路升级打怪', type: '系统流' },
            ].map((template, i) => (
              <button
                key={i}
                onClick={() => setFormData({ ...formData, prompt: template.desc, type: template.type })}
                className="card p-4 text-left hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold mb-1">{template.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{template.desc}</p>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                  {template.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateScript
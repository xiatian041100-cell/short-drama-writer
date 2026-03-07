import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Clock, FileText, Plus, Crown, Zap } from 'lucide-react'

function Dashboard({ user }) {
  const [scripts, setScripts] = useState([
    {
      id: 1,
      title: '穷小子逆袭记',
      prompt: '一个穷小子意外获得超能力，开始逆袭人生...',
      status: 'completed',
      episodes: 80,
      createdAt: '2026-03-06',
      type: '爽剧'
    },
    {
      id: 2,
      title: '穿越之医妃传奇',
      prompt: '现代女医生穿越到古代，用医术改变命运...',
      status: 'generating',
      episodes: 0,
      createdAt: '2026-03-07',
      type: '穿越'
    }
  ])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">已完成</span>
      case 'generating':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">生成中</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">失败</span>
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">我的剧本</h1>
        <p className="text-gray-600">管理和查看你生成的所有短剧剧本</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">总剧本数</p>
              <p className="text-3xl font-bold">{scripts.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">已完成</p>
              <p className="text-3xl font-bold">{scripts.filter(s => s.status === 'completed').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">今日剩余</p>
              <p className="text-3xl font-bold">
                {user.membership?.type === 'free' ? `${1 - (user.membership?.dailyUsage || 0)}/1` : '∞'}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">会员等级</p>
              <div className="flex items-center">
                <p className="text-xl font-bold capitalize">{user.membership?.type || 'free'}</p>
                {user.membership?.type !== 'free' && <Crown className="w-5 h-5 text-yellow-500 ml-2" />}
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">剧本列表</h2>
        <Link to="/create" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          创建新剧本
        </Link>
      </div>

      {/* Scripts List */}
      <div className="space-y-4">
        {scripts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有剧本</h3>
            <p className="text-gray-600 mb-4">创建你的第一个短剧剧本</p>
            <Link to="/create" className="btn-primary">
              <Sparkles className="w-5 h-5 mr-2" />
              开始创作
            </Link>
          </div>
        ) : (
          scripts.map((script) => (
            <div key={script.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{script.title}</h3>
                    {getStatusBadge(script.status)}
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {script.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-1">{script.prompt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{script.episodes} 集</span>
                    <span>•</span>
                    <span>{script.createdAt}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {script.status === 'completed' && (
                    <Link
                      to={`/script/${script.id}`}
                      className="btn-secondary text-sm"
                    >
                      查看详情
                    </Link>
                  )}
                  {script.status === 'generating' && (
                    <button className="btn-secondary text-sm" disabled>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                      生成中...
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard
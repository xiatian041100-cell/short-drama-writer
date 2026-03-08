'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, Plus, Settings, LogOut, User, CreditCard, 
  Clock, CheckCircle, Loader2, Sparkles, TrendingUp,
  FileText, ChevronRight, Trash2, Eye, Search,
  Filter, X, Calendar, Tag, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, apiRequest } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Script {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  episodesCount: number;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  creditsUsed: number;
  retryCount: number;
  createdAt: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  credits: number;
  membershipType: string;
}

const genres = ['全部', '爽剧', '甜宠', '悬疑', '古装', '玄幻', '都市', '复仇', '穿越'];
const statuses = [
  { id: 'all', name: '全部', color: 'bg-slate-500' },
  { id: 'COMPLETED', name: '已完成', color: 'bg-emerald-500' },
  { id: 'GENERATING', name: '生成中', color: 'bg-amber-500' },
  { id: 'FAILED', name: '失败', color: 'bg-red-500' },
];

const sortOptions = [
  { id: 'newest', name: '最新创建' },
  { id: 'oldest', name: '最早创建' },
  { id: 'title', name: '标题排序' },
  { id: 'episodes', name: '集数排序' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'scripts' | 'settings'>('scripts');
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [scriptsRes, userRes] = await Promise.all([
        apiRequest('/scripts', { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setScripts(scriptsRes.scripts || []);
      setUserInfo(userRes.user);
    } catch (error: any) {
      toast({ title: '获取数据失败', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and Sort Scripts
  const filteredScripts = useMemo(() => {
    let result = [...scripts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(script => 
        script.title.toLowerCase().includes(query) ||
        script.prompt.toLowerCase().includes(query) ||
        script.genre.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (selectedGenre !== '全部') {
      result = result.filter(script => script.genre === selectedGenre);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(script => script.status === selectedStatus);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      result = result.filter(script => new Date(script.createdAt) >= filterDate);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'episodes':
          return b.episodesCount - a.episodesCount;
        default:
          return 0;
      }
    });

    return result;
  }, [scripts, searchQuery, selectedGenre, selectedStatus, sortBy, dateRange]);

  // Stats based on filtered results
  const stats = useMemo(() => {
    const filtered = filteredScripts;
    return {
      total: filtered.length,
      completed: filtered.filter(s => s.status === 'COMPLETED').length,
      generating: filtered.filter(s => s.status === 'GENERATING').length,
      totalEpisodes: filtered.reduce((acc, s) => acc + (s.episodesCount || 0), 0),
    };
  }, [filteredScripts]);

  const handleLogout = () => {
    logout();
    router.push('/');
    toast({ title: '已退出登录' });
  };

  const handleDeleteScript = async (scriptId: string) => {
    if (!confirm('确定要删除这个剧本吗？')) return;
    try {
      await apiRequest(`/scripts/${scriptId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setScripts(scripts.filter(s => s.id !== scriptId));
      toast({ title: '删除成功' });
    } catch (error: any) {
      toast({ title: '删除失败', description: error.message, variant: 'destructive' });
    }
  };

  const handleRetryScript = async (scriptId: string) => {
    try {
      toast({ title: '开始重试...', description: '正在重新生成剧本' });
      
      await apiRequest(`/scripts/${scriptId}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // 更新本地状态
      setScripts(scripts.map(s => 
        s.id === scriptId 
          ? { ...s, status: 'GENERATING' as const }
          : s
      ));
      
      toast({ title: '重试已开始', description: '请查看实时进度' });
    } catch (error: any) {
      toast({ title: '重试失败', description: error.message, variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('全部');
    setSelectedStatus('all');
    setSortBy('newest');
    setDateRange('all');
  };

  const hasActiveFilters = searchQuery || selectedGenre !== '全部' || selectedStatus !== 'all' || dateRange !== 'all';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'GENERATING': return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'FAILED': return <div className="w-4 h-4 rounded-full bg-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '已完成';
      case 'GENERATING': return '生成中';
      case 'FAILED': return '失败';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-violet-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r border-slate-800/50 bg-slate-950/50 backdrop-blur-xl flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">影刃剧本</h1>
              <p className="text-xs text-slate-500">AI创作平台</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'scripts' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>我的剧本</span>
            {scripts.length > 0 && (
              <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded-full">
                {scripts.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'settings' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>设置</span>
          </button>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userInfo?.name || user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{userInfo?.email || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-400">积分余额</span>
              <span className="text-violet-400 font-medium">{userInfo?.credits || 0}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'scripts' ? (
            <motion.div
              key="scripts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">我的剧本</h2>
                  <p className="text-slate-400 mt-1">管理和查看你生成的所有剧本</p>
                </div>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
                    <Plus className="w-4 h-4 mr-2" />
                    新建剧本
                  </Button>
                </Link>
              </div>

              {/* Search and Filter Bar */}
              <div className="mb-6 space-y-4">
                {/* Search Input */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索剧本标题、创意描述..."
                      className="pl-10 bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-600"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-slate-500 hover:text-white" />
                      </button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`border-slate-700 ${showFilters ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'text-slate-400'}`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                    {hasActiveFilters && (
                      <span className="ml-2 w-2 h-2 rounded-full bg-violet-500" />
                    )}
                  </Button>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="glass-card p-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-4 gap-4">
                        {/* Genre Filter */}
                        <div>
                          <label className="text-xs text-slate-500 mb-2 block">剧本类型</label>
                          <div className="flex flex-wrap gap-2">
                            {genres.map(genre => (
                              <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                  selectedGenre === genre
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                    : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {genre}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                          <label className="text-xs text-slate-500 mb-2 block">状态</label>
                          <div className="flex flex-wrap gap-2">
                            {statuses.map(status => (
                              <button
                                key={status.id}
                                onClick={() => setSelectedStatus(status.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                                  selectedStatus === status.id
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                    : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                {status.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Date Range */}
                        <div>
                          <label className="text-xs text-slate-500 mb-2 block">创建时间</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'all', name: '全部' },
                              { id: 'today', name: '今天' },
                              { id: 'week', name: '最近7天' },
                              { id: 'month', name: '最近30天' },
                            ].map(range => (
                              <button
                                key={range.id}
                                onClick={() => setDateRange(range.id as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                  dateRange === range.id
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                    : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {range.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sort */}
                        <div>
                          <label className="text-xs text-slate-500 mb-2 block">排序方式</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950/50 text-slate-300 border border-slate-800 focus:border-violet-500/50 focus:outline-none"
                          >
                            {sortOptions.map(option => (
                              <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                          <button
                            onClick={clearFilters}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            清除筛选
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results Count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    共 <span className="text-white font-medium">{filteredScripts.length}</span> 个剧本
                    {hasActiveFilters && ' (已筛选)'}
                  </span>
                  {hasActiveFilters && (
                    <div className="flex gap-2">
                      {selectedGenre !== '全部' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {selectedGenre}
                        </span>
                      )}
                      {selectedStatus !== 'all' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {statuses.find(s => s.id === selectedStatus)?.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                      <p className="text-xs text-slate-500">总剧本数</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.completed}</p>
                      <p className="text-xs text-slate-500">已完成</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.generating}</p>
                      <p className="text-xs text-slate-500">生成中</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalEpisodes}</p>
                      <p className="text-xs text-slate-500">总集数</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Scripts List */}
              {filteredScripts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-900/50 flex items-center justify-center">
                    <Search className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {hasActiveFilters ? '没有找到匹配的剧本' : '还没有剧本'}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {hasActiveFilters ? '尝试调整筛选条件' : '开始创作你的第一个AI短剧剧本吧'}
                  </p>
                  {hasActiveFilters ? (
                    <Button onClick={clearFilters} variant="outline" className="border-slate-700">
                      清除筛选
                    </Button>
                  ) : (
                    <Link href="/create">
                      <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        创建剧本
                      </Button>
                    </Link>
                  )}
                </motion.div>
              ) : (
                <div className="grid gap-4">
                  {filteredScripts.map((script, index) => (
                    <motion.div
                      key={script.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 hover:border-violet-500/30 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                              {script.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                              script.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                              script.status === 'GENERATING' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {getStatusIcon(script.status)}
                              {getStatusText(script.status)}
                            </span>
                            {script.status === 'FAILED' && script.retryCount > 0 && (
                              <span className="text-xs text-slate-500">
                                已重试 {script.retryCount}/3 次
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{script.prompt}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {script.genre}
                            </span>
                            <span>{script.episodesCount}集</span>
                            <span>{new Date(script.createdAt).toLocaleDateString('zh-CN')}</span>
                            {script.creditsUsed > 0 && (
                              <span className="text-violet-400">-{script.creditsUsed}积分</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {script.status === 'COMPLETED' && (
                            <Link href={`/scripts/${script.id}`}>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          {script.status === 'FAILED' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRetryScript(script.id)}
                              className="text-slate-400 hover:text-amber-400"
                              title={`重试 (${script.retryCount || 0}/3)`}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteScript(script.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">设置</h2>
              
              <div className="max-w-2xl space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">账户信息</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400">昵称</span>
                      <span className="text-white">{userInfo?.name || user?.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400">邮箱</span>
                      <span className="text-white">{userInfo?.email || user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400">会员类型</span>
                      <span className="text-violet-400">
                        {userInfo?.membershipType === 'premium' ? '高级会员' : 
                         userInfo?.membershipType === 'basic' ? '基础会员' : '免费用户'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-slate-400">积分余额</span>
                      <span className="text-fuchsia-400 font-semibold">{userInfo?.credits || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">充值</h3>
                  <p className="text-slate-400 text-sm mb-4">购买积分以生成更多剧本</p>
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" className="border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/10">
                      <CreditCard className="w-4 h-4 mr-2" />
                      100积分
                    </Button>
                    <Button variant="outline" className="border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/10">
                      <CreditCard className="w-4 h-4 mr-2" />
                      500积分
                    </Button>
                    <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      1000积分
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

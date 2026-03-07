'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, Wand2, Film, Loader2, CheckCircle,
  Lightbulb, Heart, Sword, Ghost, Crown, Rocket, Brain,
  ChevronRight, Clock, Zap, Target, Users, Palette, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore, apiRequest } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useWebSocket, WebSocketMessage } from '@/lib/websocket';
import Link from 'next/link';

const genres = [
  { id: '爽剧', name: '爽剧', icon: Zap, color: 'from-amber-500 to-orange-500', desc: '打脸逆袭，一路开挂' },
  { id: '甜宠', name: '甜宠', icon: Heart, color: 'from-pink-500 to-rose-500', desc: '高糖恋爱，甜到心坎' },
  { id: '悬疑', name: '悬疑', icon: Brain, color: 'from-slate-500 to-gray-500', desc: '层层反转，烧脑推理' },
  { id: '古装', name: '古装', icon: Crown, color: 'from-amber-600 to-yellow-600', desc: '权谋宫斗，江湖侠义' },
  { id: '玄幻', name: '玄幻', icon: Ghost, color: 'from-violet-500 to-purple-500', desc: '修仙问道，奇幻冒险' },
  { id: '都市', name: '都市', icon: Rocket, color: 'from-blue-500 to-cyan-500', desc: '职场奋斗，现代生活' },
  { id: '复仇', name: '复仇', icon: Sword, color: 'from-red-500 to-rose-600', desc: '血债血偿，快意恩仇' },
  { id: '穿越', name: '穿越', icon: Clock, color: 'from-emerald-500 to-teal-500', desc: '时空穿梭，改写命运' },
];

const examplePrompts = [
  "一个外卖骑手意外获得透视能力，在赌石市场一夜暴富，却被前女友和富二代联手陷害",
  "女总裁为了躲避家族联姻，雇佣了一个穷小子假扮男友，没想到对方竟是隐藏身份的豪门继承人",
  "现代法医穿越到古代，用科学手段破解连环命案，却卷入皇室夺嫡之争",
  "被家族抛弃的废柴少年，觉醒上古血脉，一路打脸曾经欺辱过他的人",
  "顶级杀手退隐江湖开起小餐馆，却被仇家找上门，被迫重出江湖保护家人",
];

interface GenerationState {
  scriptId: string | null;
  stage: string;
  progress: number;
  message: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error?: string;
}

export default function CreatePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('爽剧');
  const [generationState, setGenerationState] = useState<GenerationState>({
    scriptId: null,
    stage: '',
    progress: 0,
    message: '',
    status: 'idle',
  });

  // WebSocket 消息处理
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('WebSocket message:', message);
    
    switch (message.type) {
      case 'progress':
        setGenerationState(prev => ({
          ...prev,
          stage: message.stage || prev.stage,
          progress: message.progress || prev.progress,
          message: message.message || prev.message,
          status: 'generating',
        }));
        break;
        
      case 'complete':
        setGenerationState(prev => ({
          ...prev,
          progress: 100,
          message: message.message || '剧本生成完成！',
          status: 'completed',
        }));
        toast({
          title: '生成完成',
          description: `《${message.data?.title || '新剧本'}》已生成完毕`,
        });
        // 延迟跳转
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        break;
        
      case 'error':
        setGenerationState(prev => ({
          ...prev,
          message: message.message || '生成失败',
          status: 'error',
          error: message.message,
        }));
        toast({
          title: '生成失败',
          description: message.message,
          variant: 'destructive',
        });
        break;
    }
  }, [toast, router]);

  // 初始化 WebSocket
  const { isConnected } = useWebSocket({
    token,
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('WebSocket connected'),
    onDisconnect: () => console.log('WebSocket disconnected'),
  });

  useEffect(() => {
    if (!token) {
      router.push('/');
    }
  }, [token, router]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: '请输入创意描述', variant: 'destructive' });
      return;
    }

    if (!isConnected) {
      toast({ 
        title: '连接中...', 
        description: '正在建立实时连接，请稍候',
      });
      return;
    }

    setGenerationState({
      scriptId: null,
      stage: 'outline',
      progress: 0,
      message: '正在提交生成任务...',
      status: 'generating',
    });
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, genre: selectedGenre }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const data = await response.json();
      
      setGenerationState(prev => ({
        ...prev,
        scriptId: data.script.id,
      }));
      
      toast({
        title: '生成任务已创建',
        description: 'AI正在创作你的剧本，请稍候...',
      });

    } catch (error: any) {
      setGenerationState(prev => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));
      toast({ title: '生成失败', description: error.message, variant: 'destructive' });
    }
  };

  const useExample = (example: string) => {
    setPrompt(example);
  };

  // 生成中状态页面
  if (generationState.status === 'generating' || generationState.status === 'completed') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-32 h-32 mx-auto mb-8"
          >
            {/* Animated rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-violet-500/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              {generationState.status === 'completed' ? (
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              ) : (
                <Wand2 className="w-12 h-12 text-violet-400" />
              )}
            </div>
          </motion.div>

          <motion.h2 
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {generationState.status === 'completed' ? '生成完成！' : 'AI正在创作中'}
          </motion.h2>
          
          <motion.p 
            className="text-slate-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {generationState.message}
          </motion.p>

          <div className="w-full bg-slate-900 rounded-full h-2 mb-4 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${generationState.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span className={generationState.progress >= 0 ? 'text-violet-400' : ''}>构思</span>
            <span className={generationState.progress >= 30 ? 'text-violet-400' : ''}>角色</span>
            <span className={generationState.progress >= 50 ? 'text-violet-400' : ''}>大纲</span>
            <span className={generationState.progress >= 80 ? 'text-violet-400' : ''}>资产</span>
          </div>

          {!isConnected && generationState.status === 'generating' && (
            <motion.div 
              className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              连接断开，正在重连...
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // 错误状态
  if (generationState.status === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center"
          >
            <AlertCircle className="w-12 h-12 text-red-400" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">生成失败</h2>
          <p className="text-slate-400 mb-6">{generationState.error}</p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setGenerationState({
                scriptId: null,
                stage: '',
                progress: 0,
                message: '',
                status: 'idle',
              })}
              className="border-slate-700"
            >
              重试
            </Button>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
                返回 Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div className="w-px h-6 bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">新建剧本</span>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isConnected ? '已连接' : '连接中...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Step 1: Genre Selection */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">选择剧本类型</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {genres.map((genre) => {
                const Icon = genre.icon;
                const isSelected = selectedGenre === genre.id;
                return (
                  <motion.button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border transition-all text-left ${
                      isSelected 
                        ? 'border-violet-500/50 bg-violet-500/10' 
                        : 'border-slate-800/50 bg-slate-900/30 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selectedGenre"
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
                      />
                    )}
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${genre.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-medium text-white mb-1">{genre.name}</h3>
                      <p className="text-xs text-slate-500">{genre.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Prompt Input */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-fuchsia-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">描述你的创意</h2>
            </div>

            <div className="glass-card p-6">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你的短剧创意，比如：一个外卖骑手意外获得透视能力，在赌石市场一夜暴富..."
                className="min-h-[160px] bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-600 resize-none focus:border-violet-500/50 focus:ring-violet-500/20"
              />
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {prompt.length}/500 字
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || !isConnected}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50"
                >
                  {!isConnected ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      连接中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      开始生成
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Step 3: Examples */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Film className="w-4 h-4 text-pink-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">灵感示例</h2>
            </div>

            <div className="grid gap-3">
              {examplePrompts.map((example, index) => (
                <motion.button
                  key={index}
                  onClick={() => useExample(example)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                  className="text-left p-4 rounded-xl border border-slate-800/50 bg-slate-900/30 hover:border-violet-500/30 transition-all group"
                >
                  <p className="text-slate-300 text-sm group-hover:text-white transition-colors">
                    {example}
                  </p>
                  <p className="text-xs text-violet-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    点击使用此创意
                  </p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Features Preview */}
          <section className="pt-8 border-t border-slate-800/50">
            <h3 className="text-sm font-medium text-slate-400 mb-4">生成内容包含</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="font-medium text-white">哲学内核</p>
                  <p className="text-xs text-slate-500">深层主题</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <p className="font-medium text-white">角色系统</p>
                  <p className="text-xs text-slate-500">完整人设</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Film className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="font-medium text-white">80集大纲</p>
                  <p className="text-xs text-slate-500">分集剧情</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">视觉资产</p>
                  <p className="text-xs text-slate-500">MJ提示词</p>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}

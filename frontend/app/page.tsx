'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, apiRequest } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { Film, Loader2, Sparkles, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, name };

      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setAuth(data.user, data.token);
      toast({
        title: isLogin ? '登录成功' : '注册成功',
        description: `欢迎回来，${data.user.name || data.user.email}！`,
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: '出错了',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-600/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card p-8 shadow-2xl glow-violet">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Film className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gradient">影刃剧本</h1>
              <p className="text-slate-400 text-sm mt-1">AI智能短剧创作平台</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 text-sm font-medium">昵称</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="输入你的昵称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-semibold py-6 mt-2 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? '登录' : '注册'}
                  <Sparkles className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 hover:text-white text-sm transition-colors hover:underline underline-offset-4"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-900/40 text-slate-500">核心功能</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-slate-950/30 border border-slate-800/50 hover:bg-violet-500/10 transition-colors">
              <div className="text-2xl font-bold text-violet-400">80集</div>
              <div className="text-xs text-slate-500 mt-1">完整剧本</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-950/30 border border-slate-800/50 hover:bg-fuchsia-500/10 transition-colors">
              <div className="flex items-center justify-center gap-1">
                <Zap className="w-5 h-5 text-fuchsia-400" />
                <span className="text-lg font-bold text-fuchsia-400">AI</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">智能生成</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-950/30 border border-slate-800/50 hover:bg-pink-500/10 transition-colors">
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-5 h-5 text-pink-400" />
                <span className="text-lg font-bold text-pink-400">MJ</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">视觉资产</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          一句话生成专业级短剧剧本
        </p>
      </div>
    </div>
  );
}

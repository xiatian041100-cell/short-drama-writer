'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileText, Users, Film, Palette, Download,
  ChevronRight, ChevronDown, Copy, Check, Clock,
  Target, Sparkles, Zap, Crown, BookOpen, Image as ImageIcon,
  FileDown, FileJson, FileType, FileSpreadsheet, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuthStore, apiRequest } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  age: string;
  gender: string;
  role: string;
  personality: string[];
  visualGenes: {
    primaryColor: string;
    contrastColor: string;
    materials: string[];
    lighting: string;
    style: string;
    signature: string;
  };
}

interface Episode {
  episodeNumber: number;
  title: string;
  scenes: Array<{
    sceneNumber: string;
    time: string;
    location: string;
    characters: string[];
    props: string[];
    content: string;
    climax: string;
    hook: string;
  }>;
  isPaywall: boolean;
  paywallType?: string;
}

interface Asset {
  type: 'character' | 'scene' | 'prop';
  name: string;
  episodeRef: number;
  prompt: string;
  parameters: string;
}

interface Script {
  id: string;
  title: string;
  genre: string;
  outline: {
    philosophy: string;
    oneCard: string;
    worldBuilding: string;
  };
  characters: Character[];
  episodes: Episode[];
  assets: Asset[];
}

const exportFormats = [
  { id: 'markdown', name: 'Markdown', icon: FileText, desc: '适合文档编辑' },
  { id: 'word', name: 'Word 文档', icon: FileType, desc: 'HTML 格式，可被 Word 打开' },
  { id: 'text', name: '纯文本', icon: FileDown, desc: '简洁文本格式' },
  { id: 'json', name: 'JSON', icon: FileJson, desc: '结构化数据' },
  { id: 'csv', name: 'CSV (仅分集)', icon: FileSpreadsheet, desc: '表格数据' },
];

export default function ScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedEpisodes, setExpandedEpisodes] = useState<number[]>([1]);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    fetchScript();
  }, [token, params.id]);

  const fetchScript = async () => {
    try {
      const data = await apiRequest(`/scripts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScript(data.script);
    } catch (error: any) {
      toast({ title: '获取剧本失败', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    if (!script) return;
    
    setIsExporting(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/export/${script.id}?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '导出失败');
      }

      // 获取文件名
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${script.title}.${format === 'markdown' ? 'md' : format === 'word' ? 'html' : format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = decodeURIComponent(match[1]);
        }
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ 
        title: '导出成功', 
        description: `已下载: ${filename}` 
      });

    } catch (error: any) {
      toast({ 
        title: '导出失败', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleEpisode = (episodeNumber: number) => {
    setExpandedEpisodes(prev => 
      prev.includes(episodeNumber) 
        ? prev.filter(n => n !== episodeNumber)
        : [...prev, episodeNumber]
    );
  };

  const copyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(id);
    toast({ title: '已复制到剪贴板' });
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">剧本不存在或已被删除</p>
          <Link href="/dashboard">
            <Button className="mt-4">返回 Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <h1 className="font-semibold text-white">{script.title}</h1>
              <p className="text-xs text-slate-500">{script.genre} · {script.episodes?.length || 0}集</p>
            </div>
          </div>
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-700 hover:border-violet-500/50"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <DropdownMenuItem
                    key={format.id}
                    onClick={() => handleExport(format.id)}
                    className="flex items-start gap-3 py-3 cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
                  >
                    <Icon className="w-5 h-5 text-violet-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">{format.name}</p>
                      <p className="text-xs text-slate-500">{format.desc}</p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="outline" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800/50 p-1">
            <TabsTrigger value="outline" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
              <Target className="w-4 h-4 mr-2" />
              大纲
            </TabsTrigger>
            <TabsTrigger value="characters" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
              <Users className="w-4 h-4 mr-2" />
              角色
            </TabsTrigger>
            <TabsTrigger value="episodes" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
              <Film className="w-4 h-4 mr-2" />
              分集
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
              <Palette className="w-4 h-4 mr-2" />
              资产
            </TabsTrigger>
          </TabsList>

          {/* Outline Tab */}
          <TabsContent value="outline" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">一卡亮点</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">{script.outline?.oneCard || '暂无'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-fuchsia-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">哲学内核</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">{script.outline?.philosophy || '暂无'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-pink-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">世界观</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">{script.outline?.worldBuilding || '暂无'}</p>
            </motion.div>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters">
            <div className="grid grid-cols-2 gap-4">
              {script.characters?.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-violet-400">{character.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{character.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400">
                          {character.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">
                        {character.gender} · {character.age}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {character.personality?.map((trait, i) => (
                          <span key={i} className="px-2 py-1 rounded-md text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20">
                            {trait}
                          </span>
                        ))}
                      </div>

                      {character.visualGenes && (
                        <div className="space-y-2 pt-4 border-t border-slate-800">
                          <p className="text-xs text-slate-500 font-medium">视觉基因</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-slate-700"
                                style={{ backgroundColor: character.visualGenes.primaryColor }}
                              />
                              <span className="text-slate-400">主色: {character.visualGenes.primaryColor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-slate-700"
                                style={{ backgroundColor: character.visualGenes.contrastColor }}
                              />
                              <span className="text-slate-400">对比: {character.visualGenes.contrastColor}</span>
                            </div>
                          </div>
                          <p className="text-slate-400">风格: {character.visualGenes.style}</p>
                          <p className="text-slate-400">光影: {character.visualGenes.lighting}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Episodes Tab */}
          <TabsContent value="episodes">
            <div className="space-y-3">
              {script.episodes?.map((episode, index) => (
                <motion.div
                  key={episode.episodeNumber}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="glass-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleEpisode(episode.episodeNumber)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-violet-400 font-mono text-sm">
                        EP{String(episode.episodeNumber).padStart(2, '0')}
                      </span>
                      <span className="text-white font-medium">{episode.title}</span>
                      {episode.isPaywall && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          付费卡点
                        </span>
                      )}
                    </div>
                    {expandedEpisodes.includes(episode.episodeNumber) ? (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedEpisodes.includes(episode.episodeNumber) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800/50"
                      >
                        <div className="p-4 space-y-4">
                          {episode.scenes?.map((scene, sceneIndex) => (
                            <div key={sceneIndex} className="bg-slate-950/50 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <span className="text-violet-400">{scene.sceneNumber}</span>
                                <span>·</span>
                                <span>{scene.time}</span>
                                <span>·</span>
                                <span>{scene.location}</span>
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed mb-3">{scene.content}</p>
                              {scene.climax && (
                                <div className="flex items-start gap-2">
                                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-amber-400/80">{scene.climax}</p>
                                </div>
                              )}
                              {scene.hook && (
                                <div className="flex items-start gap-2 mt-2">
                                  <Target className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-fuchsia-400/80">{scene.hook}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets">
            <div className="grid gap-4">
              {script.assets?.map((asset, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        asset.type === 'character' ? 'bg-violet-500/20' :
                        asset.type === 'scene' ? 'bg-fuchsia-500/20' : 'bg-pink-500/20'
                      }`}>
                        <ImageIcon className={`w-5 h-5 ${
                          asset.type === 'character' ? 'text-violet-400' :
                          asset.type === 'scene' ? 'text-fuchsia-400' : 'text-pink-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{asset.name}</h3>
                        <p className="text-xs text-slate-500">
                          {asset.type === 'character' ? '角色' : asset.type === 'scene' ? '场景' : '道具'} · 
                          第{asset.episodeRef}集
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrompt(asset.prompt, `asset-${index}`)}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedPrompt === `asset-${index}` ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="bg-slate-950/50 rounded-lg p-4">
                    <p className="text-sm text-slate-300 font-mono leading-relaxed">{asset.prompt}</p>
                  </div>
                  {asset.parameters && (
                    <p className="text-xs text-slate-500 mt-2">参数: {asset.parameters}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

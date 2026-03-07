import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  Film, 
  Palette, 
  BookOpen,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

function ScriptDetail({ user }) {
  const { id } = useParams();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchScript();
  }, [id]);

  const fetchScript = async () => {
    try {
      // 模拟数据 - 后续替换为真实API
      // const response = await scriptAPI.getById(id);
      // setScript(response.data);
      
      // 模拟数据
      setTimeout(() => {
        setScript({
          id: id,
          title: '穷小子逆袭记',
          prompt: '一个穷小子意外获得超能力，开始逆袭人生，最终成为商业帝国的主宰...',
          type: '爽剧',
          style: '现代',
          status: 'completed',
          createdAt: '2026-03-07',
          episodes: Array.from({ length: 80 }, (_, i) => ({
            episodeNumber: i + 1,
            title: `第${i + 1}集：${getEpisodeTitle(i + 1)}`,
            scenes: [
              {
                sceneNumber: 1,
                location: '场景地点',
                characters: ['主角', '反派'],
                content: `这是第${i + 1}集的场景内容...`,
                dialogue: [
                  { character: '主角', text: '我不会放弃的！' },
                  { character: '反派', text: '你以为你能赢？' }
                ],
                hook: i % 3 === 0 ? '本集结尾悬念...' : null
              }
            ]
          })),
          assets: {
            characters: [
              {
                name: '林逸',
                role: '主角',
                description: '穷小子，意外获得超能力',
                mjPrompt: 'A young man in his 20s, wearing simple clothes, determined expression, modern city background, cinematic lighting, 8k, hyperrealistic --ar 9:16'
              },
              {
                name: '王总',
                role: '反派',
                description: '商业巨头，看不起穷人',
                mjPrompt: 'A middle-aged businessman in expensive suit, arrogant expression, luxury office background, dramatic lighting, 8k, hyperrealistic --ar 9:16'
              }
            ],
            scenes: [
              {
                name: '贫民窟',
                description: '主角最初生活的地方',
                mjPrompt: 'Poor neighborhood, narrow streets, old buildings, sunset lighting, cinematic atmosphere, 8k, concept art --ar 16:9'
              },
              {
                name: '商业大厦',
                description: '最终对决的地点',
                mjPrompt: 'Modern skyscraper, glass facade, night city view, neon lights, cyberpunk style, 8k, concept art --ar 16:9'
              }
            ]
          },
          paymentHooks: [
            { episode: 10, type: '身份揭露', description: '主角真实身份即将曝光' },
            { episode: 25, type: '实力爆发', description: '主角展示真正实力' },
            { episode: 50, type: '终极对决', description: '正面对决反派' }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('获取剧本失败');
      setLoading(false);
    }
  };

  const getEpisodeTitle = (num) => {
    const titles = [
      '命运的转折', '意外的收获', '初试锋芒', '暗流涌动', '危机四伏',
      '绝处逢生', '崭露头角', '强敌来袭', '背水一战', '真相大白'
    ];
    return titles[(num - 1) % titles.length] + (num > 10 ? ` (${Math.floor(num/10)}-${num%10})` : '');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const content = generateScriptContent();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title}.md`;
    a.click();
  };

  const generateScriptContent = () => {
    let content = `# ${script.title}\n\n`;
    content += `**类型**: ${script.type} | **风格**: ${script.style}\n\n`;
    content += `**创意来源**: ${script.prompt}\n\n`;
    content += `---\n\n`;
    
    script.episodes.forEach(ep => {
      content += `## ${ep.title}\n\n`;
      ep.scenes.forEach(scene => {
        content += `### 场景 ${scene.sceneNumber}: ${scene.location}\n\n`;
        content += `**人物**: ${scene.characters.join(', ')}\n\n`;
        content += `${scene.content}\n\n`;
        if (scene.dialogue.length > 0) {
          content += `**对白**:\n`;
          scene.dialogue.forEach(d => {
            content += `- **${d.character}**: ${d.text}\n`;
          });
          content += `\n`;
        }
        if (scene.hook) {
          content += `**本集钩子**: ${scene.hook}\n\n`;
        }
      });
      content += `---\n\n`;
    });
    
    return content;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Link to="/dashboard" className="btn-primary mt-4 inline-block">
            返回仪表盘
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{script.title}</h1>
            <p className="text-gray-600 text-sm">
              {script.type} · {script.style} · {script.episodes.length}集 · {script.createdAt}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(generateScriptContent())}
            className="btn-secondary"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button onClick={downloadScript} className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            下载剧本
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: '概览', icon: BookOpen },
            { id: 'episodes', label: '分集剧本', icon: Film },
            { id: 'assets', label: '视觉资产', icon: Palette },
            { id: 'hooks', label: '付费卡点', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 创意来源 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">创意来源</h3>
              <p className="text-gray-600">{script.prompt}</p>
            </div>

            {/* 统计信息 */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <p className="text-3xl font-bold text-primary-600">{script.episodes.length}</p>
                <p className="text-sm text-gray-600">总集数</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-3xl font-bold text-accent-600">{script.assets.characters.length}</p>
                <p className="text-sm text-gray-600">角色数</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{script.assets.scenes.length}</p>
                <p className="text-sm text-gray-600">场景数</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{script.paymentHooks.length}</p>
                <p className="text-sm text-gray-600">付费卡点</p>
              </div>
            </div>

            {/* 角色列表 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">主要角色</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {script.assets.characters.map((char, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold">{char.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{char.name}</p>
                        <p className="text-sm text-gray-500">{char.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{char.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="space-y-4">
            {script.episodes.map((episode) => (
              <div key={episode.episodeNumber} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{episode.title}</h3>
                  <span className="text-sm text-gray-500">第{episode.episodeNumber}集</span>
                </div>
                {episode.scenes.map((scene, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-primary-600">
                        场景 {scene.sceneNumber}
                      </span>
                      <span className="text-sm text-gray-500">{scene.location}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{scene.content}</p>
                    {scene.dialogue.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {scene.dialogue.map((d, dIdx) => (
                          <p key={dIdx} className="text-sm mb-1 last:mb-0">
                            <span className="font-medium">{d.character}:</span> {d.text}
                          </p>
                        ))}
                      </div>
                    )}
                    {scene.hook && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <strong>本集钩子:</strong> {scene.hook}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            {/* 角色资产 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">角色视觉资产</h3>
              <div className="space-y-4">
                {script.assets.characters.map((char, i) => (
                  <div key={i} className="card p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-semibold text-lg">{char.name}</h4>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        {char.role}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{char.description}</p>
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-500">Midjourney Prompt:</span>
                        <button
                          onClick={() => copyToClipboard(char.mjPrompt)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {char.mjPrompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 场景资产 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">场景视觉资产</h3>
              <div className="space-y-4">
                {script.assets.scenes.map((scene, i) => (
                  <div key={i} className="card p-6">
                    <h4 className="font-semibold text-lg mb-2">{scene.name}</h4>
                    <p className="text-gray-600 mb-3">{scene.description}</p>
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-500">Midjourney Prompt:</span>
                        <button
                          onClick={() => copyToClipboard(scene.mjPrompt)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {scene.mjPrompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hooks' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">付费卡点设计</h3>
              <p className="text-gray-600 mb-6">
                专业设计的付费转化点，在关键剧情节点设置悬念，提高用户付费意愿。
              </p>
              <div className="space-y-4">
                {script.paymentHooks.map((hook, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                      {hook.episode}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">第{hook.episode}集</span>
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
                          {hook.type}
                        </span>
                      </div>
                      <p className="text-gray-700">{hook.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">卡点设计说明</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>身份揭露:</strong> 主角真实身份或隐藏能力即将曝光，在最关键时刻断集。</p>
                <p><strong>实力爆发:</strong> 长期被压制后，主角终于展现真正实力，在爆发前一秒断集。</p>
                <p><strong>终极对决:</strong> 正反派最终对决即将开始，在战斗爆发前断集。</p>
                <p><strong>情感突破:</strong> 男女主角关系即将突破，在关键时刻断集。</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScriptDetail;
// config/aiProviders.js
// 市面上主流AI API的完整配置指南

const AI_PROVIDERS = {
  // 1. OpenAI - 最主流
  openai: {
    name: 'OpenAI',
    website: 'https://platform.openai.com',
    docs: 'https://platform.openai.com/docs',
    icon: '/icons/openai.svg',
    models: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', context: 128000 },
      { id: 'gpt-4', name: 'GPT-4', context: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', context: 16385 }
    ],
    config: {
      baseUrl: 'https://api.openai.com',
      endpoint: '/v1/chat/completions',
      authType: 'bearer',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://platform.openai.com/signup 注册账号',
        '完成邮箱验证和手机验证',
        '进入 https://platform.openai.com/api-keys 创建API Key',
        '绑定支付方式（支持国内信用卡）',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://openai.com/pricing',
      freeCredits: '新用户有$5免费额度，有效期3个月'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: true,
      jsonMode: true
    }
  },

  // 2. Anthropic Claude - 高质量长文本
  anthropic: {
    name: 'Anthropic Claude',
    website: 'https://www.anthropic.com',
    docs: 'https://docs.anthropic.com',
    icon: '/icons/anthropic.svg',
    models: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', context: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', context: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', context: 200000 }
    ],
    config: {
      baseUrl: 'https://api.anthropic.com',
      endpoint: '/v1/messages',
      authType: 'apiKey',
      authHeader: 'x-api-key',
      versionHeader: 'anthropic-version',
      version: '2023-06-01'
    },
    setup: {
      steps: [
        '访问 https://console.anthropic.com/ 注册账号',
        '完成邮箱验证',
        '在控制台获取API Key',
        '绑定支付方式',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://www.anthropic.com/pricing',
      note: 'Claude在长文本处理方面表现优异，适合剧本创作'
    },
    features: {
      streaming: true,
      functionCalling: false,
      vision: true,
      jsonMode: false
    }
  },

  // 3. Google Gemini
  google: {
    name: 'Google Gemini',
    website: 'https://ai.google.dev',
    docs: 'https://ai.google.dev/docs',
    icon: '/icons/google.svg',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', context: 32768 },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', context: 32768 },
      { id: 'gemini-ultra', name: 'Gemini Ultra', context: 32768 }
    ],
    config: {
      baseUrl: 'https://generativelanguage.googleapis.com',
      endpoint: '/v1beta/models/{model}:generateContent',
      authType: 'apiKey',
      authHeader: 'key',
      authInQuery: true
    },
    setup: {
      steps: [
        '访问 https://makersuite.google.com/app/apikey 获取API Key',
        '登录Google账号',
        '点击"Create API Key"',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://ai.google.dev/pricing',
      freeTier: '每分钟60次请求免费'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: true,
      jsonMode: true
    }
  },

  // 4. 月之暗面 Kimi - 国产优秀
  moonshot: {
    name: '月之暗面 Kimi',
    website: 'https://platform.moonshot.cn',
    docs: 'https://platform.moonshot.cn/docs',
    icon: '/icons/moonshot.svg',
    models: [
      { id: 'moonshot-v1-8k', name: 'Kimi 8K', context: 8192 },
      { id: 'moonshot-v1-32k', name: 'Kimi 32K', context: 32768 },
      { id: 'moonshot-v1-128k', name: 'Kimi 128K', context: 128000 }
    ],
    config: {
      baseUrl: 'https://api.moonshot.cn',
      endpoint: '/v1/chat/completions',
      authType: 'bearer',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://platform.moonshot.cn 注册账号',
        '完成实名认证',
        '进入控制台创建API Key',
        '充值或使用赠送额度',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://platform.moonshot.cn/docs/pricing',
      note: '国产大模型，中文理解能力强，支持超长上下文'
    },
    features: {
      streaming: true,
      functionCalling: false,
      vision: false,
      jsonMode: false
    }
  },

  // 5. 百度文心一言
  baidu: {
    name: '百度文心一言',
    website: 'https://cloud.baidu.com',
    docs: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
    icon: '/icons/baidu.svg',
    models: [
      { id: 'ernie-bot-4', name: '文心一言4.0', context: 8192 },
      { id: 'ernie-bot', name: '文心一言', context: 4096 },
      { id: 'ernie-bot-turbo', name: '文心一言Turbo', context: 4096 }
    ],
    config: {
      baseUrl: 'https://aip.baidubce.com',
      endpoint: '/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/{model}',
      authType: 'oauth',
      tokenEndpoint: '/oauth/2.0/token'
    },
    setup: {
      steps: [
        '访问 https://cloud.baidu.com 注册百度智能云账号',
        '完成实名认证',
        '进入千帆大模型平台',
        '创建应用获取API Key和Secret Key',
        '在系统中配置AK和SK'
      ],
      pricing: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Blfmc9djq',
      note: '需要AK/SK获取access_token'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: false,
      jsonMode: false
    }
  },

  // 6. 阿里通义千问
  alibaba: {
    name: '阿里通义千问',
    website: 'https://dashscope.aliyun.com',
    docs: 'https://help.aliyun.com/document_detail/2587494.html',
    icon: '/icons/alibaba.svg',
    models: [
      { id: 'qwen-max', name: '通义千问Max', context: 32768 },
      { id: 'qwen-plus', name: '通义千问Plus', context: 32768 },
      { id: 'qwen-turbo', name: '通义千问Turbo', context: 32768 }
    ],
    config: {
      baseUrl: 'https://dashscope.aliyuncs.com',
      endpoint: '/api/v1/services/aigc/text-generation/generation',
      authType: 'apiKey',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://dashscope.aliyun.com 注册阿里云账号',
        '开通DashScope服务',
        '在控制台创建API Key',
        '充值或使用免费额度',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://dashscope.aliyun.com/pricing',
      freeTier: '新用户有100万token免费额度'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: true,
      jsonMode: true
    }
  },

  // 7. 智谱AI GLM
  zhipu: {
    name: '智谱AI GLM',
    website: 'https://open.bigmodel.cn',
    docs: 'https://open.bigmodel.cn/dev/api',
    icon: '/icons/zhipu.svg',
    models: [
      { id: 'glm-4', name: 'GLM-4', context: 128000 },
      { id: 'glm-3-turbo', name: 'GLM-3-Turbo', context: 32768 }
    ],
    config: {
      baseUrl: 'https://open.bigmodel.cn',
      endpoint: '/api/paas/v4/chat/completions',
      authType: 'apiKey',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://open.bigmodel.cn 注册账号',
        '完成实名认证',
        '在控制台获取API Key',
        '充值或使用赠送额度',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://open.bigmodel.cn/pricing',
      note: '清华系大模型，中文理解能力强'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: false,
      jsonMode: false
    }
  },

  // 8. 讯飞星火
  xinghuo: {
    name: '讯飞星火',
    website: 'https://xinghuo.xfyun.cn',
    docs: 'https://www.xfyun.cn/doc/spark/Web.html',
    icon: '/icons/xfyun.svg',
    models: [
      { id: 'v3.5', name: '星火V3.5', context: 8192 },
      { id: 'v3', name: '星火V3.0', context: 8192 },
      { id: 'v2', name: '星火V2.0', context: 8192 }
    ],
    config: {
      baseUrl: 'https://spark-api-open.xf-yun.com',
      endpoint: '/v1/chat/completions',
      authType: 'bearer',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://xinghuo.xfyun.cn 注册讯飞账号',
        '进入开放平台创建应用',
        '获取APPID、APISecret、APIKey',
        '在系统中配置三个参数'
      ],
      pricing: 'https://xinghuo.xfyun.cn/sparkapi',
      freeTier: '个人认证有免费额度'
    },
    features: {
      streaming: true,
      functionCalling: false,
      vision: false,
      jsonMode: false
    }
  },

  // 9. MiniMax
  minimax: {
    name: 'MiniMax',
    website: 'https://www.minimaxi.com',
    docs: 'https://www.minimaxi.com/document',
    icon: '/icons/minimax.svg',
    models: [
      { id: 'abab6-chat', name: 'abab6', context: 32768 },
      { id: 'abab5.5-chat', name: 'abab5.5', context: 16384 }
    ],
    config: {
      baseUrl: 'https://api.minimax.chat',
      endpoint: '/v1/text/chatcompletion_v2',
      authType: 'bearer',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://www.minimaxi.com 注册账号',
        '进入开发者平台',
        '创建应用获取API Key',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://www.minimaxi.com/pricing',
      note: '国内优秀大模型，支持语音和文本'
    },
    features: {
      streaming: true,
      functionCalling: false,
      vision: false,
      jsonMode: false
    }
  },

  // 10. Azure OpenAI
  azure: {
    name: 'Azure OpenAI',
    website: 'https://azure.microsoft.com',
    docs: 'https://learn.microsoft.com/azure/ai-services/openai',
    icon: '/icons/azure.svg',
    models: [
      { id: 'gpt-4', name: 'GPT-4', context: 8192 },
      { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo', context: 4096 }
    ],
    config: {
      baseUrl: 'https://{resource-name}.openai.azure.com',
      endpoint: '/openai/deployments/{deployment-name}/chat/completions',
      authType: 'apiKey',
      authHeader: 'api-key',
      apiVersion: '2024-02-15-preview'
    },
    setup: {
      steps: [
        '访问 https://azure.microsoft.com 注册Azure账号',
        '申请OpenAI服务访问权限',
        '创建OpenAI资源',
        '部署模型获取端点URL和API Key',
        '在系统中配置资源名、部署名和API Key'
      ],
      pricing: 'https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/',
      note: '企业级服务，需要企业邮箱申请'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: true,
      jsonMode: true
    }
  },

  // 11. Cohere
  cohere: {
    name: 'Cohere',
    website: 'https://cohere.com',
    docs: 'https://docs.cohere.com',
    icon: '/icons/cohere.svg',
    models: [
      { id: 'command-r-plus', name: 'Command R+', context: 128000 },
      { id: 'command-r', name: 'Command R', context: 128000 },
      { id: 'command', name: 'Command', context: 4096 }
    ],
    config: {
      baseUrl: 'https://api.cohere.ai',
      endpoint: '/v1/chat',
      authType: 'bearer',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://cohere.com 注册账号',
        '在Dashboard获取API Key',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://cohere.com/pricing',
      freeTier: '有免费试用额度'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: false,
      jsonMode: false
    }
  },

  // 12. Mistral AI
  mistral: {
    name: 'Mistral AI',
    website: 'https://mistral.ai',
    docs: 'https://docs.mistral.ai',
    icon: '/icons/mistral.svg',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', context: 32768 },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', context: 32768 },
      { id: 'mistral-small-latest', name: 'Mistral Small', context: 32768 }
    ],
    config: {
      baseUrl: 'https://api.mistral.ai',
      endpoint: '/v1/chat/completions',
      authType: 'bearer',
      authHeader: 'Authorization',
      authPrefix: 'Bearer '
    },
    setup: {
      steps: [
        '访问 https://console.mistral.ai 注册账号',
        '创建工作空间',
        '创建API Key',
        '复制API Key到本系统配置'
      ],
      pricing: 'https://mistral.ai/pricing',
      note: '欧洲大模型，性能优秀'
    },
    features: {
      streaming: true,
      functionCalling: true,
      vision: false,
      jsonMode: true
    }
  },

  // 13. 腾讯混元
  tencent: {
    name: '腾讯混元',
    website: 'https://cloud.tencent.com',
    docs: 'https://cloud.tencent.com/document/product/1729',
    icon: '/icons/tencent.svg',
    models: [
      { id: 'hunyuan-pro', name: '混元Pro', context: 32768 },
      { id: 'hunyuan-standard', name: '混元Standard', context: 32768 }
    ],
    config: {
      baseUrl: 'https://hunyuan.tencentcloudapi.com',
      endpoint: '/',
      authType: 'aksk',
      signatureMethod: 'TC3-HMAC-SHA256'
    },
    setup: {
      steps: [
        '访问 https://cloud.tencent.com 注册腾讯云账号',
        '完成实名认证',
        '开通混元大模型服务',
        '在API密钥管理获取SecretId和SecretKey',
        '在系统中配置AK和SK'
      ],
      pricing: 'https://cloud.tencent.com/document/product/1729/97731',
      note: '需要SecretId和SecretKey进行签名'
    },
    features: {
      streaming: true,
      functionCalling: false,
      vision: false,
      jsonMode: false
    }
  },

  // 14. 本地/自定义模型
  llama: {
    name: 'Llama (本地/第三方)',
    website: 'https://llama.meta.com',
    docs: 'https://github.com/meta-llama/llama',
    icon: '/icons/meta.svg',
    models: [
      { id: 'llama-3-70b', name: 'Llama 3 70B', context: 8192 },
      { id: 'llama-3-8b', name: 'Llama 3 8B', context: 8192 }
    ],
    config: {
      baseUrl: 'http://localhost:11434', // Ollama默认端口
      endpoint: '/v1/chat/completions',
      authType: 'none',
      custom: true
    },
    setup: {
      steps: [
        '使用Ollama或vLLM部署本地模型',
        '或使用第三方API服务（如Groq、Together等）',
        '配置自定义API端点',
        '设置API Key（如需要）'
      ],
      note: '支持任何OpenAI兼容的API端点'
    },
    features: {
      streaming: true,
      functionCalling: false,
      vision: false,
      jsonMode: false
    }
  }
};

module.exports = AI_PROVIDERS;

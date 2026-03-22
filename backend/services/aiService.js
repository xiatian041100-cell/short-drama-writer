// services/aiService.js - 统一AI服务调用层
const axios = require('axios');
const AIModel = require('../models/AIModel');
const AI_PROVIDERS = require('../config/aiProviders');
const EncryptionService = require('./encryptionService');
const { logger } = require('../utils/logger');

class AIService {
  // 获取所有可用的AI提供商配置
  static getAvailableProviders() {
    return Object.entries(AI_PROVIDERS).map(([key, provider]) => ({
      id: key,
      name: provider.name,
      icon: provider.icon,
      website: provider.website,
      docs: provider.docs,
      models: provider.models,
      features: provider.features,
      setup: provider.setup
    }));
  }

  // 获取特定提供商的详细配置
  static getProviderConfig(providerId) {
    return AI_PROVIDERS[providerId];
  }

  // 生成文本（统一接口）
  static async generate(modelId, messages, options = {}) {
    const model = await AIModel.findById(modelId);
    if (!model || !model.isActive) {
      throw new Error('AI模型不可用');
    }

    const provider = AI_PROVIDERS[model.provider];
    if (!provider) {
      throw new Error('不支持的AI提供商');
    }

    // 根据提供商调用不同的方法
    switch (model.provider) {
      case 'openai':
      case 'moonshot':
      case 'zhipu':
      case 'minimax':
        return this.callOpenAICompatible(model, messages, options);
      
      case 'anthropic':
        return this.callAnthropic(model, messages, options);
      
      case 'google':
        return this.callGoogle(model, messages, options);
      
      case 'baidu':
        return this.callBaidu(model, messages, options);
      
      case 'alibaba':
        return this.callAlibaba(model, messages, options);
      
      case 'xinghuo':
        return this.callXinghuo(model, messages, options);
      
      case 'azure':
        return this.callAzure(model, messages, options);
      
      case 'cohere':
        return this.callCohere(model, messages, options);
      
      case 'mistral':
        return this.callMistral(model, messages, options);
      
      case 'tencent':
        return this.callTencent(model, messages, options);
      
      case 'llama':
        return this.callOpenAICompatible(model, messages, options);
      
      default:
        throw new Error('未知的AI提供商');
    }
  }

  // OpenAI兼容格式（OpenAI、Moonshot、智谱、MiniMax、Llama等）
  static async callOpenAICompatible(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];
    
    let baseUrl = model.apiConfig.baseUrl || provider.config.baseUrl;
    let endpoint = model.apiConfig.endpoint || provider.config.endpoint;

    // Azure特殊处理
    if (model.provider === 'azure') {
      endpoint = endpoint.replace('{deployment-name}', model.modelId);
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    // 认证
    if (provider.config.authType === 'bearer') {
      headers[provider.config.authHeader] = `${provider.config.authPrefix || 'Bearer '}${credentials.apiKey}`;
    } else if (provider.config.authType === 'apiKey') {
      headers[provider.config.authHeader] = `${provider.config.authPrefix || ''}${credentials.apiKey}`;
    }

    // 版本头（Anthropic等）
    if (provider.config.versionHeader) {
      headers[provider.config.versionHeader] = provider.config.version;
    }

    const requestBody = {
      model: model.modelId,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: options.temperature || model.config.temperature,
      max_tokens: options.maxTokens || model.config.maxTokens,
      stream: options.stream || false
    };

    // 添加top_p（如果支持）
    if (model.config.topP !== undefined) {
      requestBody.top_p = model.config.topP;
    }

    const response = await axios.post(
      `${baseUrl}${endpoint}`,
      requestBody,
      {
        headers,
        timeout: model.config.timeout,
        responseType: options.stream ? 'stream' : 'json'
      }
    );

    if (options.stream) {
      return response.data;
    }

    // 更新统计
    await this.updateModelStats(model, response.data.usage);

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: model.modelId
    };
  }

  // Anthropic Claude
  static async callAnthropic(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await axios.post(
      `${provider.config.baseUrl}${provider.config.endpoint}`,
      {
        model: model.modelId,
        max_tokens: options.maxTokens || model.config.maxTokens,
        temperature: options.temperature || model.config.temperature,
        system: systemMessage,
        messages: userMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: options.stream || false
      },
      {
        headers: {
          [provider.config.authHeader]: credentials.apiKey,
          [provider.config.versionHeader]: provider.config.version,
          'Content-Type': 'application/json'
        },
        timeout: model.config.timeout,
        responseType: options.stream ? 'stream' : 'json'
      }
    );

    if (options.stream) {
      return response.data;
    }

    const usage = response.data.usage;
    await this.updateModelStats(model, usage);

    return {
      content: response.data.content[0].text,
      usage: {
        prompt_tokens: usage.input_tokens,
        completion_tokens: usage.output_tokens,
        total_tokens: usage.input_tokens + usage.output_tokens
      },
      model: model.modelId
    };
  }

  // Google Gemini
  static async callGoogle(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const endpoint = provider.config.endpoint.replace('{model}', model.modelId);

    const response = await axios.post(
      `${provider.config.baseUrl}${endpoint}?key=${credentials.apiKey}`,
      {
        contents: formattedMessages,
        generationConfig: {
          temperature: options.temperature || model.config.temperature,
          maxOutputTokens: options.maxTokens || model.config.maxTokens,
          topP: model.config.topP
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: model.config.timeout
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    
    // Gemini不返回token统计，估算
    const estimatedTokens = Math.ceil(content.length / 4);
    
    return {
      content,
      usage: {
        prompt_tokens: 0,
        completion_tokens: estimatedTokens,
        total_tokens: estimatedTokens
      },
      model: model.modelId
    };
  }

  // 百度文心一言
  static async callBaidu(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    // 获取access_token
    const tokenResponse = await axios.post(
      `${provider.config.baseUrl}${provider.config.tokenEndpoint}`,
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: credentials.apiKey,
          client_secret: credentials.secretKey
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const endpoint = provider.config.endpoint.replace('{model}', model.modelId);

    const response = await axios.post(
      `${provider.config.baseUrl}${endpoint}?access_token=${accessToken}`,
      {
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || model.config.temperature,
        max_output_tokens: options.maxTokens || model.config.maxTokens,
        stream: options.stream || false
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: model.config.timeout,
        responseType: options.stream ? 'stream' : 'json'
      }
    );

    if (options.stream) {
      return response.data;
    }

    return {
      content: response.data.result,
      usage: response.data.usage,
      model: model.modelId
    };
  }

  // 阿里通义千问
  static async callAlibaba(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    const response = await axios.post(
      `${provider.config.baseUrl}${provider.config.endpoint}`,
      {
        model: model.modelId,
        input: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        },
        parameters: {
          temperature: options.temperature || model.config.temperature,
          max_tokens: options.maxTokens || model.config.maxTokens,
          top_p: model.config.topP,
          result_format: 'message'
        }
      },
      {
        headers: {
          [provider.config.authHeader]: `${provider.config.authPrefix}${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: model.config.timeout
      }
    );

    return {
      content: response.data.output.choices[0].message.content,
      usage: response.data.usage,
      model: model.modelId
    };
  }

  // 讯飞星火
  static async callXinghuo(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    const response = await axios.post(
      `${provider.config.baseUrl}${provider.config.endpoint}`,
      {
        model: model.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || model.config.temperature,
        max_tokens: options.maxTokens || model.config.maxTokens,
        stream: options.stream || false
      },
      {
        headers: {
          [provider.config.authHeader]: `${provider.config.authPrefix}${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: model.config.timeout,
        responseType: options.stream ? 'stream' : 'json'
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: model.modelId
    };
  }

  // Azure OpenAI
  static async callAzure(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    const baseUrl = model.apiConfig.baseUrl.replace('{resource-name}', credentials.resourceName);
    const endpoint = provider.config.endpoint.replace('{deployment-name}', model.modelId);

    const response = await axios.post(
      `${baseUrl}${endpoint}?api-version=${provider.config.apiVersion}`,
      {
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || model.config.temperature,
        max_tokens: options.maxTokens || model.config.maxTokens,
        top_p: model.config.topP,
        stream: options.stream || false
      },
      {
        headers: {
          [provider.config.authHeader]: credentials.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: model.config.timeout,
        responseType: options.stream ? 'stream' : 'json'
      }
    );

    if (options.stream) {
      return response.data;
    }

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: model.modelId
    };
  }

  // Cohere
  static async callCohere(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    const response = await axios.post(
      `${provider.config.baseUrl}${provider.config.endpoint}`,
      {
        model: model.modelId,
        message: messages[messages.length - 1].content,
        chat_history: messages.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
          message: m.content
        })),
        temperature: options.temperature || model.config.temperature,
        max_tokens: options.maxTokens || model.config.maxTokens,
        stream: options.stream || false
      },
      {
        headers: {
          [provider.config.authHeader]: `${provider.config.authPrefix}${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: model.config.timeout,
        responseType: options.stream ? 'stream' : 'json'
      }
    );

    return {
      content: response.data.text,
      usage: response.data.meta?.tokens,
      model: model.modelId
    };
  }

  // Mistral
  static async callMistral(model, messages, options) {
    // Mistral是OpenAI兼容格式
    return this.callOpenAICompatible(model, messages, options);
  }

  // 腾讯混元
  static async callTencent(model, messages, options) {
    const credentials = model.getCredentials();
    const provider = AI_PROVIDERS[model.provider];

    // 腾讯云需要签名，这里简化处理
    // 实际实现需要使用腾讯云SDK
    const response = await axios.post(
      `${provider.config.baseUrl}${provider.config.endpoint}`,
      {
        Model: model.modelId,
        Messages: messages.map(m => ({
          Role: m.role,
          Content: m.content
        })),
        Temperature: options.temperature || model.config.temperature,
        MaxTokens: options.maxTokens || model.config.maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: model.config.timeout
      }
    );

    return {
      content: response.data.Choices[0].Message.Content,
      usage: response.data.Usage,
      model: model.modelId
    };
  }

  // 更新模型统计
  static async updateModelStats(model, usage) {
    if (!usage) return;

    model.stats.totalRequests += 1;
    model.stats.totalTokens += (usage.total_tokens || 0);
    await model.save();
  }

  // 流式响应处理
  static async *streamGenerator(modelId, messages, options = {}) {
    const model = await AIModel.findById(modelId);
    if (!model || !model.isActive) {
      throw new Error('AI模型不可用');
    }

    const stream = await this.generate(modelId, messages, { ...options, stream: true });

    // 根据不同提供商解析流式数据
    // 这里简化处理，实际需要根据提供商格式解析
    for await (const chunk of stream) {
      yield chunk;
    }
  }
}

module.exports = AIService;

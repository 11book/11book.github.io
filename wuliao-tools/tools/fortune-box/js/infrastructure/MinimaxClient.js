/**
 * Minimax AI 客户端
 * 处理与 AI 的通信
 */

export class MinimaxClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || this.getApiKey();
    this.baseUrl = 'https://api.minimax.chat/v1';
    this.model = 'MiniMax-M2.7';
  }

  getApiKey() {
    // 从 localStorage 或环境变量获取
    return localStorage.getItem('minimax_api_key') || '';
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('minimax_api_key', key);
  }

  /**
   * 发送聊天请求
   * @param {string} systemPrompt
   * @param {string} userMessage
   * @returns {Promise<string>}
   */
  async chat(systemPrompt, userMessage) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const response = await fetch(`${this.baseUrl}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.9,  // 高随机性
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('[MinimaxClient] Chat error:', error);
      throw error;
    }
  }
}

// 导出单例
export const minimaxClient = new MinimaxClient();

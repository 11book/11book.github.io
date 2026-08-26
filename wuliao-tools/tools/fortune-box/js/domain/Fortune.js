/**
 * Fortune 实体 - 一次抽签的结果
 * 包含输入、AI生成结果、动画信息
 */
export class Fortune {
  constructor({
    id = crypto.randomUUID(),
    input,
    style = 'dark-mysterious',
    generated = null,
    animationId = null,
    animationModule = null,
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.input = input;
    this.style = style;
    this.generated = generated;  // { type, title, text, params }
    this.animationId = animationId;
    this.animationModule = animationModule;
    this.createdAt = createdAt;
  }

  // 从存储恢复
  static fromJSON(json) {
    return new Fortune(json);
  }

  // 序列化为JSON
  toJSON() {
    return {
      id: this.id,
      input: this.input,
      style: this.style,
      generated: this.generated,
      animationId: this.animationId,
      animationModule: this.animationModule,
      createdAt: this.createdAt
    };
  }

  // 获取类型标签
  getTypeLabel() {
    const labels = {
      prediction: '预知类',
      timetravel: '穿越类',
      prank: '整蛊类',
      mystic: '玄学类',
      badluck: '坏签类'
    };
    return labels[this.generated?.type] || '未知';
  }

  // 格式化时间
  getFormattedTime() {
    const date = new Date(this.createdAt);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

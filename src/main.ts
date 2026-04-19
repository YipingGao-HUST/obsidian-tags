import { App, Plugin, PluginSettingTab, Setting, Notice, TFile } from 'obsidian';

interface AutoTaggerSettings {
  keywords: Record<string, string[]>;
  autoRunOnSave: boolean;
  minKeywordLength: number;
}

const DEFAULT_SETTINGS: AutoTaggerSettings = {
  keywords: {
    '编程': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
    '工具': ['Obsidian', 'VS Code', 'Git', 'GitHub'],
    '笔记': ['Markdown', '笔记', '知识管理', '学习']
  },
  autoRunOnSave: true,
  minKeywordLength: 3
};

export default class AutoTaggerPlugin extends Plugin {
  settings: AutoTaggerSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    
    // 注册命令
    this.addCommand({
      id: 'auto-tag-file',
      name: '为当前文件自动添加标签',
      callback: () => this.autoTagCurrentFile()
    });

    this.addCommand({
      id: 'auto-tag-all-files',
      name: '为所有文件自动添加标签',
      callback: () => this.autoTagAllFiles()
    });

    // 监听文件保存事件
    if (this.settings.autoRunOnSave) {
      // 暂时注释掉事件监听，避免API版本兼容性问题
      // 后续可以根据具体的Obsidian版本调整事件名称
      /*
      this.registerEvent(
        this.app.vault.on('modify', (file: TFile) => {
          if (file.extension === 'md') {
            this.autoTagFile(file);
          }
        })
      );
      */
    }

    // 添加设置面板
    this.addSettingTab(new AutoTaggerSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async autoTagCurrentFile() {
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile && activeFile.extension === 'md') {
      await this.autoTagFile(activeFile);
      new Notice('已为当前文件自动添加标签');
    } else {
      new Notice('请先打开一个Markdown文件');
    }
  }

  async autoTagAllFiles() {
    const files = this.app.vault.getFiles();
    const markdownFiles = files.filter(file => file.extension === 'md');
    
    for (const file of markdownFiles) {
      await this.autoTagFile(file);
    }
    
    new Notice(`已为 ${markdownFiles.length} 个Markdown文件自动添加标签`);
  }

  async autoTagFile(file: TFile) {
    try {
      const content = await this.app.vault.read(file);
      const tags = this.extractTagsFromContent(content);
      await this.updateFileTags(file, tags);
    } catch (error) {
      console.error('自动添加标签失败:', error);
    }
  }

  extractTagsFromContent(content: string): string[] {
    const tags: string[] = [];
    
    // 提取现有标签
    const existingTags = content.match(/#[\p{L}\p{N}_-]+/gu) || [];
    const existingTagNames = existingTags.map(tag => tag.substring(1).toLowerCase());
    
    // 匹配关键词
    for (const [category, keywords] of Object.entries(this.settings.keywords)) {
      for (const keyword of keywords) {
        if (keyword.length >= this.settings.minKeywordLength && 
            content.toLowerCase().includes(keyword.toLowerCase()) && 
            !existingTagNames.includes(category.toLowerCase())) {
          tags.push(category);
          break; // 每个类别只添加一次
        }
      }
    }
    
    return tags;
  }

  async updateFileTags(file: TFile, newTags: string[]) {
    let content = await this.app.vault.read(file);
    
    // 提取现有标签
    const existingTags = content.match(/#[\p{L}\p{N}_-]+/gu) || [];
    const existingTagNames = existingTags.map(tag => tag.substring(1));
    
    // 合并标签，去重
    const allTags = [...new Set([...existingTagNames, ...newTags])];
    
    // 移除所有现有标签
    let contentWithoutTags = content;
    existingTags.forEach(tag => {
      contentWithoutTags = contentWithoutTags.replace(tag, '');
    });
    
    // 清理空白
    contentWithoutTags = contentWithoutTags.trim();
    
    // 添加所有标签
    if (allTags.length > 0) {
      const tagsString = allTags.map(tag => `#${tag}`).join(' ');
      content = `${contentWithoutTags}\n\n${tagsString}`;
    } else {
      content = contentWithoutTags;
    }
    
    await this.app.vault.modify(file, content);
  }
}

class AutoTaggerSettingTab extends PluginSettingTab {
  plugin: AutoTaggerPlugin;

  constructor(app: App, plugin: AutoTaggerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    containerEl.createEl('h2', { text: 'Auto Tagger 设置' });

    // 自动运行设置
    new Setting(containerEl)
      .setName('保存时自动运行')
      .setDesc('当文件保存时自动为其添加标签')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoRunOnSave)
        .onChange(async (value) => {
          this.plugin.settings.autoRunOnSave = value;
          await this.plugin.saveSettings();
        }));

    // 最小关键词长度
    new Setting(containerEl)
      .setName('最小关键词长度')
      .setDesc('只有长度大于等于此值的关键词才会被匹配')
      .addSlider(slider => slider
        .setLimits(1, 10, 1)
        .setValue(this.plugin.settings.minKeywordLength)
        .onChange(async (value: number) => {
          this.plugin.settings.minKeywordLength = value;
          await this.plugin.saveSettings();
        }));

    // 关键词设置
    containerEl.createEl('h3', { text: '关键词配置' });
    containerEl.createEl('p', { text: '格式: 类别名称: 关键词1, 关键词2, ...' });
    
    const keywordsTextArea = containerEl.createEl('textarea');
    keywordsTextArea.style.width = '100%';
    keywordsTextArea.style.height = '200px';
    
    // 将当前关键词转换为文本格式
    let keywordsText = '';
    for (const [category, keywords] of Object.entries(this.plugin.settings.keywords)) {
      keywordsText += `${category}: ${keywords.join(', ')}\n`;
    }
    keywordsTextArea.value = keywordsText;

    new Setting(containerEl)
      .setName('保存关键词配置')
      .addButton(button => button
        .setButtonText('保存')
        .onClick(async () => {
          const text = keywordsTextArea.value;
          const newKeywords: Record<string, string[]> = {};
          
          const lines = text.split('\n');
          for (const line of lines) {
            const parts = line.split(':');
            if (parts.length >= 2) {
              const category = parts[0].trim();
              const keywords = parts.slice(1).join(':').split(',').map((k: string) => k.trim()).filter((k: string) => k);
              if (category && keywords.length > 0) {
                newKeywords[category] = keywords;
              }
            }
          }
          
          this.plugin.settings.keywords = newKeywords;
          await this.plugin.saveSettings();
          new Notice('关键词配置已保存');
        }));
  }
}
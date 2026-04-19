# Obsidian Auto Tagger

An Obsidian plugin that automatically adds tags to your notes based on keyword matching in the file content.

## Features

- **Auto Tagging**: Automatically matches keywords in your note content and adds corresponding tags
- **Manual Tagging**: Use commands to tag the current file or all files at once
- **Customizable Keywords**: Configure your own keyword-to-tag mappings in the settings
- **Save Trigger**: Option to automatically run tagging when files are saved

## Installation

### From Obsidian Community (Recommended)

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "Auto Tagger"
4. Click Install and enable the plugin

### Manual Installation

1. Download the latest release
2. Copy the `obsidian-tags` folder to your vault's `.obsidian/plugins/` directory
3. Enable the plugin in Obsidian Settings

## Usage

### Commands

- **Auto Tag Current File**: Tag the currently active Markdown file
- **Auto Tag All Files**: Tag all Markdown files in your vault

### Settings

1. **Save Trigger**: Enable to automatically tag files when they are saved
2. **Minimum Keyword Length**: Set the minimum length for keyword matching
3. **Keyword Configuration**: Define your own keyword-to-tag mappings

Example keyword configuration:
```
编程: JavaScript, TypeScript, Python, Java, C++
工具: Obsidian, VS Code, Git, GitHub
笔记: Markdown, 笔记, 知识管理, 学习
```

## Development

### Prerequisites

- Node.js >= 16
- npm

### Build

```bash
npm install
npm run build
```

### Dev Mode

```bash
npm run dev
```

## License

MIT

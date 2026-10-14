# 零基础韩语课

从韩文字母、发音到日常语法与练习的静态课程网站。完整同步 Korea 目录中的五节课程：01 音标、02 语法 日常生活、03 语法 主语助词、04 场所助词、05 天气与四季。另保留互动拼读、单词句子和入门视频。

## 同步本地课程

`courses/` 保存原始 Markdown 笔记和引用的图片；`course-data.js` 是由笔记生成的完整网页内容。发布使用已生成的静态文件，访客不需要 Python。

```powershell
python -m pip install -r tools/requirements-courses.txt
npm run courses:sync -- "C:\Users\baoba\Documents\Obsidian Vault\Korea"
```

五课按原文件编号显示，所有练习与参考答案保留。以后从 Korea 目录同步，或直接修改 `courses/*.md` 后运行 `npm run courses:sync`。不要手动编辑生成的 `course-data.js`。目录之外的笔记不会被复制。

课程同步脚本的检查：`python -m unittest discover -s tests -p test_sync_courses.py`。

## 发布到 GitHub Pages

本项目使用纯静态文件，无需构建命令。提交并推送 `main` 分支：

```powershell
git status
git add .
git commit -m "feat: publish Korean course site"
git push -u origin main
```

然后在 GitHub 仓库打开 `Settings → Pages`：

1. `Source` 选择 `Deploy from a branch`。
2. `Branch` 选择 `main` 和 `/(root)`。
3. 保存后访问 <https://bobvincent666.github.io/korean-learning/>。

页面使用 `#lesson-1` 形式的课程地址，因此刷新和分享课程链接不需要服务器路由。

## 启动

需要 Node.js 22 或更新版本。在本文件所在目录运行：

```powershell
npm start
```

然后在浏览器打开 <http://127.0.0.1:8765/>。按 `Ctrl+C` 停止本地服务。无需安装项目依赖；页面中的字体与视频需要联网。

## 发音

点击任意小喇叭优先播放随网站发布的韩语 MP3，无需访客安装语音包或配置云端密钥。可以选择正常／慢速，也可以重复上一段。若音频文件加载失败，才尝试浏览器的韩语语音（`ko-KR`）；不会改用中文或英语声线。辅音按钮播放明确标注的示范音节，例如 `ㄱ → 가`。

## 预生成音频

`audio/manifest.json` 从教材数据导出，目前对应 149 段不重复的韩语文本；`audio/*.mp3` 是随网站发布的音频素材。重新生成时，在 Windows 上运行：

```powershell
python -m venv .venv-audio
.\.venv-audio\Scripts\python.exe -m pip install -r tools\requirements-audio.txt
npm run audio:manifest
.\.venv-audio\Scripts\python.exe tools\generate-audio.py
node tools\verify-audio.mjs
```

音频生成还需 FFmpeg。脚本默认跳过已存在的音频，仅在明确传入 `--force` 时覆盖；可先用 `--sample` 合成六段代表样本。模型由脚本下载到本机 Hugging Face 缓存，不放入项目，也不需要云端语音服务密钥。

声源：[Ppaso-TTS v1](https://huggingface.co/akamotaco/ppaso-tts-v1)，固定提交 `53d09664c4f636a5fb6f2ebe3ec22cd83ee249b9`，模型卡标注 Apache-2.0。模型作者提示其音色偏机械，少见读音可能不准；自动校验只能排除缺失、损坏和静音，公开作为发音教材前仍建议请熟练韩语的人抽听，尤其是孤立音节与连音句子。

当前音频制作日期：2026-09-16（UTC+8）。制作环境为 Python 3.12、FFmpeg 8.1，Python 直接依赖版本记录在 `tools/requirements-audio.txt`。模型原始字音转换器会产生若干未训练的复合元音音素；生成脚本将其拆为模型词表内的基本音素，避免不同音节被合成为完全相同的文件。校验器也会拒绝新的跨音节重复音频；`외/웨` 等原本同音的韩文仍可重复。不同机器上的音频编码不保证逐字节相同。

## 测试

```powershell
npm test
```

拼读组合、四表数据、发音选择、内容渲染和本地服务都有自动检查。

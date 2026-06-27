# 简繁转换器 · Chinese Simplified ↔ Traditional Converter

一个纯前端的在线简繁转换小工具：把简体中文与繁体中文互相转换，**词组优先、单字兜底**，转换在浏览器本地完成，不上传文本、可离线使用。

在线使用：<https://cell70horn.github.io/chinese-simplified-traditional-converter/>

## 为什么不是“一个字换一个字”

简繁转换真正的难点是 **一简对多繁**——同一个简体字在不同词里对应不同繁体：

| 简体 | 正确（按词） | 只换单字的常见错误 |
| --- | --- | --- |
| 头发 | 頭**髮** | 頭發 ✗ |
| 发现 | **發**現 | 髮現 ✗ |
| 皇后 | 皇**后** | 皇後 ✗ |
| 以后 | 以**後** | 以后（漏转）✗ |
| 面条 | **麵**條 | 面條 ✗ |

所以本工具采用与 OpenCC 一致的做法：

1. **简 → 繁**：先用词组表 `STPhrases`（约 4.9 万条）做**最长匹配**，命中整词就按词义转换；词组里没有的字再用单字表 `STCharacters` 逐字转换。
2. **繁 → 简**：用单字表 `TSCharacters` 逐字转换（繁转简的歧义远小于简转繁）。

每条映射取首选值。

## 数据来源（重要）

转换词库**不是凭空生成的**，全部来自开源项目 [OpenCC（开放中文转换）](https://github.com/BYVoid/OpenCC)，许可为 Apache-2.0。本仓库内置其
`STPhrases.txt` / `STCharacters.txt` / `TSCharacters.txt` 三份词典数据（见 `opencc-data.js` 与 `NOTICE`）。

繁体字形与释义另参考 [Unicode Unihan 数据库](https://www.unicode.org/charts/unihan.html) 的 `kSimplifiedVariant` / `kTraditionalVariant` 字段，以及 [萌典](https://www.moedict.tw/)（依据中華民國教育部辭典）。

## 直接用输入法打繁体

本工具适合把**已有的简体文本**批量转成繁体。如果你是**从头打字**，与其先打简体再转换，不如直接在输入法里开启简繁切换、打字即出繁体——例如
[搜狗输入法的繁体、注音与粤语设置](https://sogouinputmethod.com/traditional/)，电脑版按 `Ctrl+Shift+F` 即可在简体 / 繁体输出间即时切换。

## 本地运行

纯静态页面，无需构建：

```bash
git clone https://github.com/cell70horn/chinese-simplified-traditional-converter.git
cd chinese-simplified-traditional-converter
python -m http.server 8000   # 然后浏览器打开 http://localhost:8000
```

## 文件结构

- `index.html` — 工具界面与说明
- `app.js` — 转换逻辑（最长匹配 + 单字兜底 + 复制）
- `opencc-data.js` — 内置的 OpenCC 词典数据
- `NOTICE` — OpenCC 数据的 Apache-2.0 署名
- `LICENSE` — 本仓库源码的 MIT 许可

## 许可

本仓库源码采用 **MIT** 许可；内置的 OpenCC 词典数据采用 **Apache-2.0**，详见 `NOTICE`。使用时请保留相应版权与许可声明。

## 局限与校对

逐字与词组表无法覆盖一切语境，专有名词、文言、网络新词仍可能需要人工校对；港台地区用字差异（如 裏/裡、著/着）本页未做地区化，需要严格地区用字时请以当地标准（OpenCC 的 `s2tw` / `s2hk` 方案或当地辞典）为准。

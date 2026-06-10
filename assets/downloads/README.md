# 资料下载文件说明

这个目录用于存放网站提供下载的 PDF 学习资料。

## 如何添加 PDF 文件

1. 将 PDF 文件放入 `assets/downloads/` 目录。
2. 文件名建议使用英文或拼音，避免空格和特殊符号。
3. 在 `js/data.js` 中找到对应资料，把 `file` 字段从 `"#"` 改成 PDF 路径。

示例：

```js
file: "assets/downloads/sample-unit1-vocab.pdf"
```

## 文件命名建议

- 推荐：`grade7-unit1-vocab.pdf`
- 推荐：`zhongkao-writing-topics.pdf`
- 不推荐：`七年级 Unit 1 资料.pdf`

## 版权和内容要求

- 优先上传原创资料。
- 不要上传未授权的商业教辅、机构讲义或学校未公开材料。
- 如使用公开信息整理资料，请确认使用范围合理，并保留必要说明。

## 上线前检查

- 确认 `data.js` 中的 `file` 路径和实际 PDF 文件名完全一致。
- 点击页面下载按钮，确认 PDF 能正常打开。
- 如果 PDF 尚未上传，可以暂时保留 `file: "#"`。

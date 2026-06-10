# 在线后台配置说明

这个目录用于 Decap CMS 在线后台。

后台入口：

```text
/admin/
```

## 当前文件

- `index.html`：加载 Decap CMS。
- `config.yml`：后台字段、数据文件、媒体上传和 GitHub 后端配置。
- `custom.css`：后台入口和 Decap 界面的轻量美化样式。
- `admin-theme.js`：后台加载提示和“后台说明”入口。
- `help.html`：给站长使用的后台操作说明页。

## 上线前必须替换

请打开 `admin/config.yml`，替换以下占位：

```yaml
repo: wangtianjob2017-cyber/chengdu-english-station
base_url: https://chengdu-english-cms-oauth.wangtianjob2017.workers.dev
site_url: https://chengdu-english-station.pages.dev/
display_url: https://chengdu-english-station.pages.dev/
```

说明：

- `repo`：你的 GitHub 仓库，例如 `alison/chengdu-english-station`。
- `base_url`：GitHub OAuth 代理服务地址。
- `site_url` / `display_url`：正式网站地址。

## GitHub OAuth 设置

Decap CMS 的 GitHub backend 需要通过 GitHub OAuth 登录。GitHub Pages 是静态托管，不能直接保存 OAuth 密钥，因此需要额外的 OAuth 代理服务。

你需要做：

1. 在 GitHub 创建 OAuth App。
2. 把 OAuth App 的 `Client ID` 和 `Client Secret` 配置到 OAuth 代理服务。
3. 不要把 `Client Secret` 写进本仓库。
4. 把 OAuth 代理服务地址填入 `admin/config.yml` 的 `base_url`。
5. 确认登录 GitHub 的账号对仓库有 push 权限。

## 内容保存方式

后台点击保存后，Decap CMS 会把修改提交到 GitHub 仓库：

- 资料保存到 `data/resources.json`
- 文章保存到 `data/articles.json`
- 网站配置保存到 `data/site-config.json`
- PDF 上传到 `assets/downloads/`

GitHub Pages 会在仓库更新后自动重新发布网站。

## 与本地管理台的关系

- `/admin/`：正式在线 CMS 后台。
- `/admin.html`：本地离线编辑工具。

两个后台可以共存。正式发布推荐使用 `/admin/`；批量整理、导入导出、离线备份可以继续使用 `/admin.html`。

## 安全提醒

- 不要在前端代码、JSON、README 或提交记录中写入 OAuth Secret。
- 只给可信账号仓库写入权限。
- 上传 PDF 前确认资料是原创或已获授权。
- 商业合作内容必须明确标注“合作”或“广告”。

## 日常使用方法

### 媒体库是什么

后台里的“媒体”是文件库，主要用于上传和管理：

- PDF 资料
- 文章配图
- 后续公众号二维码或说明图片

当前媒体上传路径是：

```text
assets/downloads/
```

文件名建议使用英文、数字和短横线，例如：

```text
grade9-reading-main-idea.pdf
vocab-100-days-plan.pdf
```

不要上传未授权教辅、机构讲义或学校未授权材料。

### 新增一份免费资料

进入：

```text
① 免费资料 / PDF 管理 -> 资料库（资料卡片与 PDF） -> Add item
```

常用字段：

- `资料标题`：前台卡片和详情页显示的标题。
- `适用年级`：决定是否进入七年级、八年级、九年级页面。
- `A/B 卷题型`：决定是否进入按题型页面。
- `资料分类 / 所属板块`：决定资料属于 A卷题型、B卷题型、词汇中心、基础能力等。
- `上传 PDF 文件`：上传资料文件。
- `是否首页热门推荐`：打开后可能显示在首页热门资料区。
- `发布状态`：`published` 显示，`draft` 隐藏。

保存后，Decap CMS 会提交到 GitHub，Cloudflare Pages 重新部署后前台生效。

### 把资料放到首页热门资料

在资料里设置：

```text
是否首页热门推荐: true
发布状态: published
```

首页热门资料区显示数量由：

```text
③ 网站首页 / 导航配置 -> 网站基础设置 -> 首页板块显示与排序 -> 热门资料下载 -> 显示数量
```

控制。

### 把资料放到词汇中心

在资料里设置：

```text
资料分类 / 所属板块: 词汇中心
技能标签: 词汇
词汇中心分类: 同步词汇 / 中考高频词 / 易错易混词 / 词汇训练
```

词汇资料不要放进 `A/B 卷题型导航`。

### 把资料放到 A/B 卷题型页

在资料里设置：

```text
A/B 卷题型: 八、阅读理解
资料分类 / 所属板块: A卷题型
发布状态: published
```

题型名称必须和 `③ 网站首页 / 导航配置 -> A/B 卷题型导航` 中的名称一致。

### 新增一篇文章

进入：

```text
② 备考文章管理 -> 文章库（方法、规划、家长指导） -> Add item
```

常用字段：

- `唯一 ID`：建议英文，例如 `article-reading-main-idea`。
- `文章标题`：文章卡片和详情页标题。
- `文章分类`：用于文章页筛选。
- `文章详情链接`：通常填写 `article-detail.html?id=唯一ID`。
- `正文内容`：按小标题和段落填写。
- `是否首页推荐文章`：打开后可能显示在首页文章区。
- `发布状态`：`published` 显示，`draft` 隐藏。

### 用 Markdown 写长文章

如果文章较长，不想在 JSON 文章库里一段一段填写，可以进入：

```text
④ Markdown 文章发布 -> New Markdown 文章
```

适合：

- 先写长文草稿。
- 粘贴已经整理好的 Markdown 文稿。
- 后续准备迁移到更适合 SEO 的一篇文章一个文件结构。

常用字段：

- `唯一 ID`：建议英文，例如 `article-reading-main-idea`。
- `文章标题`：文章标题。
- `文章分类`：文章所属分类。
- `文章摘要`：文章卡片和 SEO 描述的基础内容。
- `发布状态`：建议先用 `draft` 存稿。
- `正文 Markdown`：直接粘贴整篇文章正文。

Markdown 基础写法：

```markdown
## 小标题

这里写正文段落。

- 列表项一
- 列表项二
```

注意：

- 当前 Markdown 文章入口已经可以在后台创建和保存文件。
- 现阶段前台文章页仍主要读取 `data/articles.json`。
- 下一阶段可以继续升级，让前台文章列表和详情页读取 `content/articles/*.md`。

### 调整首页板块

进入：

```text
③ 网站首页 / 导航配置 -> 网站基础设置 -> 首页板块显示与排序
```

可以修改：

- `板块标题`
- `板块说明`
- `是否显示这个板块`
- `排序`
- `显示数量`
- `按钮文字`
- `按钮链接`

不建议随意修改：

- `板块 ID`
- `板块类型`

### 隐藏内容，不建议直接删除

资料和文章如果暂时不想显示，优先改：

```text
发布状态: draft
```

这样前台不会显示，但后台还保留，后续可以恢复。

## 后台界面美化说明

当前后台使用 Decap CMS。它不是完全自定义后台，因此只能做轻量美化：

- 后台加载页更清楚。
- 增加了后台说明入口。
- 调整了部分字体、颜色、按钮和输入框观感。
- 优化了菜单名称、字段说明和填写提示。

Decap CMS 的核心布局、左侧导航和编辑器结构由系统控制，不能像自建后台一样完全自由设计。

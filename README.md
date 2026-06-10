# 成都中考英语加油站

## 项目介绍

成都中考英语加油站是一个面向成都初中生和家长的英语学习资料静态网站。

网站用于整理清晰、实用、可打印的英语学习资料，并提供按年级、按题型、备考文章和学习诊断等入口。项目使用 HTML、CSS、JavaScript 编写，不需要后端、不需要数据库，适合部署到 GitHub Pages。

## 项目功能

- 首页展示：展示网站介绍、热门资料、年级入口、题型入口和分数段建议。
- 免费资料库：集中展示英语学习资料，可搜索和筛选。
- 词汇中心：集中承接同步词汇、高频词、短语、默写和作文表达升级资料。
- 按年级分类：七年级、八年级、九年级分别展示对应资料。
- 按题型分类：按成都中考英语 A卷 / B卷真实题型分类。
- 备考文章：展示英语学习方法、复习规划和家长指导文章。
- 学习诊断：提供一个前端模拟诊断表，帮助判断学习重点。
- 隐私政策：说明后续收集信息时的用途和处理原则。
- 免责声明：说明资料使用边界、版权和合作推荐原则。
- SEO 基础：包含页面标题、描述、关键词、Open Graph、canonical、sitemap 和 robots。

## 目录结构

```text
chengdu-english-station/
  index.html
  resources.html
  grade-7.html
  grade-8.html
  grade-9.html
  topics.html
  articles.html
  article-detail.html
  diagnosis.html
  about.html
  privacy.html
  disclaimer.html
  resource-detail.html
  sitemap.xml
  robots.txt
  css/
    style.css
  js/
    data.js
    main.js
  assets/
    images/
    downloads/
      README.md
  README.md
```

## 如何本地打开

推荐使用 VS Code Live Server，本地测试效果最接近 GitHub Pages：

1. 用 VS Code 打开项目文件夹。
2. 安装 Live Server 插件。
3. 右键 `index.html`。
4. 选择 `Open with Live Server`。

如果只是快速预览，也可以双击 `index.html` 打开。注意：直接双击属于 `file://` 打开方式，浏览器通常不能读取 `data/*.json`，页面会自动使用 `js/data.js` 中的本地 fallback 数据。正式测试 JSON 版本时，建议使用 Live Server。

## 如何添加资料

所有免费资料都在 `data/resources.json` 中维护。

新增资料时，可以复制一条已有资料，然后修改内容。每条资料包含这些字段：

```text
id
title
grade
type
level
target
description
usage
contents
file
featured
```

简单理解：

- `id`：资料唯一编号，建议使用英文或拼音，例如 `res-grade7-unit2-vocab`。
- `title`：资料标题。
- `grade`：年级，例如 `七年级`、`八年级`、`九年级`、`全学段`。
- `type`：成都中考英语 A卷 / B卷题型，必须和 `data/site-config.json` 的 `topicGroups` 中题型名称完全一致。
- `level`：难度，例如 `基础`、`提升`、`冲刺`、`高分`。
- `target`：适合哪些学生。
- `description`：资料简介。
- `usage`：建议怎么使用这份资料。
- `contents`：资料包含哪些内容，使用数组。
- `file`：PDF 下载路径。
- `featured`：是否在首页热门资料中展示，填写 `true` 或 `false`。

如果 PDF 还没有准备好，`file` 可以先写：

```js
file: "#"
```

## A/B 卷题型维护

成都中考英语 A卷 / B卷题型统一维护在：

```text
data/site-config.json
```

请修改其中的 `topicGroups`。首页题型卡片、按题型页面、免费资料页题型筛选都会优先读取这里。

新增题型时，需要同时确认：

```text
data/resources.json
```

里面每份资料的 `type` 字段必须和 `topicGroups` 中的题型名称完全一致。

不建议随意改题型名称，因为 `type` 字段用于筛选和详情展示。如果名称多一个空格、少一个标点，资料就可能匹配不到对应题型。

## 词汇中心维护

词汇中心页面是：

```text
vocabulary.html
```

词汇资料仍然维护在：

```text
data/resources.json
```

词汇资料建议使用这些字段：

```json
{
  "category": "词汇中心",
  "skill": "词汇",
  "vocabCategory": "同步词汇"
}
```

`vocabCategory` 可填写：

```text
同步词汇
中考高频词
易错易混词
词汇训练
```

不要把词汇分类加入 `topicGroups`。`topicGroups` 只维护成都中考英语 A卷 / B卷考试题型。

词汇中心用于承接同步词汇、高频词、短语、默写、听写、易混词和作文表达升级等内容。

## 如何添加文章

所有备考文章都在 `data/articles.json` 中维护。

也可以在在线后台使用“Markdown 文章发布”入口写长文章。Markdown 文章会保存到 `content/articles/`，并由 GitHub Action 自动生成 `data/markdown-articles.json`。前台文章页会同时读取 `data/articles.json` 和 `data/markdown-articles.json`，所以后台发布后通常等待 1-3 分钟，Cloudflare Pages 自动部署完成后即可在“备考文章”页看到。

新增文章时，可以复制一篇已有文章，然后修改内容。每篇文章包含这些字段：

```text
id
title
category
target
description
date
content
faq
relatedResourceTypes
featured
```

简单理解：

- `id`：文章唯一编号，建议使用英文或拼音。
- `title`：文章标题。
- `category`：文章分类，例如 `中考规划`、`阅读理解`、`作文提升`。
- `target`：适合阅读的人群。
- `description`：文章简介。
- `date`：发布日期。
- `content`：正文内容，按小节填写。
- `faq`：常见问答。
- `relatedResourceTypes`：关联的资料题型，建议使用 `data/site-config.json` 中 `topicGroups` 的题型名称。
- `featured`：是否作为推荐文章，填写 `true` 或 `false`。

## 如何替换 PDF 下载文件

PDF 文件统一放在：

```text
assets/downloads/
```

操作步骤：

1. 把 PDF 文件放入 `assets/downloads/` 文件夹。
2. 文件名建议使用英文或拼音，不要使用空格。
3. 打开 `data/resources.json`。
4. 找到对应资料。
5. 修改 `file` 字段。

示例：

```js
file: "assets/downloads/sample-unit1-vocab.pdf"
```

文件名建议：

- 推荐：`grade7-unit1-vocab.pdf`
- 推荐：`zhongkao-writing-topics.pdf`
- 不推荐：`七年级 Unit 1 资料.pdf`

注意：

- 优先上传原创资料。
- 不要上传未授权教辅、机构讲义、学校未授权材料。
- 如果文件没有上传，页面会提示“资料文件暂未上传，请稍后再试”。

## 如何部署到 GitHub Pages

适合零基础的简单步骤：

1. 注册或登录 GitHub。
2. 创建一个新的 GitHub 仓库。
3. 把整个 `chengdu-english-station` 项目上传到仓库。
4. 进入仓库页面。
5. 点击 `Settings`。
6. 在左侧找到 `Pages`。
7. 在 `Branch` 中选择 `main` 分支。
8. 文件夹选择根目录，通常是 `/root`。
9. 点击保存。
10. 等待 GitHub 生成访问链接。

如果你的仓库名是 `chengdu-english-station`，GitHub Pages 链接通常类似：

```text
https://你的用户名.github.io/chengdu-english-station/
```

上线后，请把项目中的 `https://chengdu-english-station.pages.dev/` 替换成正式访问地址。需要替换的位置包括：

- 每个 HTML 页面中的 `canonical`
- 每个 HTML 页面中的 `og:url`
- `sitemap.xml`
- `robots.txt`

## 如何绑定域名

后续如果有自己的域名，可以在 GitHub Pages 中添加自定义域名。

大致步骤：

1. 购买或准备一个域名。
2. 在 GitHub Pages 设置中填写自定义域名。
3. 到域名服务商后台添加 DNS 解析。
4. 等待解析生效。
5. 开启 HTTPS。

如果暂时没有域名，直接使用 GitHub Pages 默认链接也可以。

## 商业化预留入口说明

项目中预留了几个克制版商业入口页面：

```text
premium.html
writing-review.html
cooperation.html
waitlist.html
```

这些页面只是后续服务和合作的说明入口，第一版不接支付、不接真实订单、不做登录系统。

- `premium.html`：精品资料包预留页。
- `writing-review.html`：作文批改预约预留页。
- `cooperation.html`：教育资源合作与广告合作说明页。
- `waitlist.html`：预约提醒表单页。

`waitlist.html` 的表单当前只是前端模拟提交，不会真实保存信息。后续可以接入：

- 飞书表单
- 腾讯问卷
- 金数据
- 或自有后端数据库

商业内容必须明确标注“广告”或“合作”，不能伪装成普通资料或普通文章。不允许使用承诺固定考试结果、夸大资料来源或暗示特殊渠道等宣传表达。

## 如何使用网页端管理台

项目提供一个本地网页端管理台：

```text
admin.html
```

使用步骤：

1. 用 VS Code Live Server 或本地静态服务器打开 `admin.html`。
2. 如需编辑当前正式数据，可以导入 `data/resources.json`、`data/articles.json`、`data/site-config.json`。
3. 在页面中新增或修改资料、文章、首页板块和导航。
4. 修改过程中可以点击“保存到本浏览器”，草稿会保存在当前浏览器的 `localStorage` 中。
5. 编辑完成后，点击导出对应 JSON。
6. 用导出的 JSON 文件替换 `data/` 目录中的原文件。
7. 提交到 GitHub。
8. 等待 GitHub Pages 更新。

注意：

- 当前管理台不是在线后台，不能自动保存到 GitHub。
- 管理台不需要、也不应该保存 GitHub token、密码或任何密钥。
- 第一版只做本地编辑、导入 JSON、导出 JSON 和浏览器草稿保存。
- 如果要实现多人在线编辑、权限控制或自动发布，需要后续接入 CMS、数据库或服务器。

## 如何使用真正在线后台

项目已新增 Decap CMS 在线后台入口：

```text
admin/
```

本地预览地址通常是：

```text
http://localhost:8765/admin/
```

上线后的访问地址通常类似：

```text
https://你的用户名.github.io/chengdu-english-station/admin/
```

Decap CMS 的作用：

1. 登录网页后台。
2. 新增或修改资料。
3. 上传 PDF 到 `assets/downloads/`。
4. 新增或修改文章。
5. 修改首页板块、导航、页脚链接和 A/B 卷题型。
6. 点击保存后，由 Decap CMS 提交到 GitHub 仓库。
7. GitHub Pages 自动更新正式网站。

上线前必须修改：

```text
admin/config.yml
```

把下面两项替换成你的真实信息：

```yaml
repo: wangtianjob2017-cyber/chengdu-english-station
base_url: https://chengdu-english-cms-oauth.wangtianjob2017.workers.dev
```

说明：

- `repo` 是你的 GitHub 仓库，例如 `alison/chengdu-english-station`。
- `base_url` 是 GitHub OAuth 登录服务地址。GitHub Pages 只是静态托管，不能自己完成 GitHub OAuth 回调，因此需要一个轻量 OAuth 代理，或改用支持 Git Gateway 的托管方案。
- 如果继续使用 GitHub Pages，推荐后续使用免费 OAuth 代理方案。
- 如果希望最省心，也可以把同一个 GitHub 仓库部署到 Netlify，并使用 Netlify Identity + Git Gateway。

当前项目保留两套后台：

- `admin/`：真正在线 CMS 后台，保存后可以提交到 GitHub。
- `admin.html`：本地离线管理工具，适合批量整理、导入导出和备份 JSON。

这两套工具不是重复劳动。`admin.html` 可以作为离线备份和数据迁移工具；`admin/` 用于正式在线发布。

Decap CMS 数据格式说明：

- `data/resources.json` 使用 `{ "resources": [...] }`。
- `data/articles.json` 使用 `{ "articles": [...] }`。
- `data/site-config.json` 继续使用对象结构。

主站脚本已经兼容旧数组格式和新的对象格式。

### Decap CMS + GitHub Pages 上线步骤

推荐正式后台方案：

```text
GitHub Pages + Decap CMS + GitHub backend + OAuth 代理
```

第一步：创建或确认 GitHub 仓库。

- 仓库建议命名为 `chengdu-english-station`。
- 仓库需要包含本项目全部文件。
- 你的 GitHub 账号需要有仓库写入权限。

第二步：开启 GitHub Pages。

1. 进入 GitHub 仓库。
2. 点击 `Settings`。
3. 点击 `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`。
6. Folder 选择 `/root`。
7. 保存后等待 GitHub Pages 生成网站地址。

第三步：创建 GitHub OAuth App。

进入 GitHub：

```text
Settings -> Developer settings -> OAuth Apps -> New OAuth App
```

填写时注意：

- Application name：可以写 `成都中考英语加油站 CMS`
- Homepage URL：填写正式网站地址
- Authorization callback URL：填写 OAuth 代理服务要求的回调地址

创建后会得到：

- Client ID
- Client Secret

第四步：部署 OAuth 代理。

GitHub Pages 是静态托管，不能保存 `Client Secret`。因此需要一个免费或低成本的 OAuth 代理服务来完成 GitHub 登录。

注意：

- `Client Secret` 只能放在 OAuth 代理服务的环境变量中。
- 不要把 `Client Secret` 写进本项目文件。
- 不要把 `Client Secret` 提交到 GitHub。

第五步：修改在线后台配置。

打开：

```text
admin/config.yml
```

替换：

```yaml
repo: wangtianjob2017-cyber/chengdu-english-station
base_url: https://chengdu-english-cms-oauth.wangtianjob2017.workers.dev
site_url: https://chengdu-english-station.pages.dev/
display_url: https://chengdu-english-station.pages.dev/
```

第六步：访问后台。

```text
https://你的用户名.github.io/chengdu-english-station/admin/
```

登录 GitHub 后，可以编辑资料、文章、PDF 文件和首页配置。保存后会生成 GitHub 提交，GitHub Pages 会自动更新网站。

## 后续升级方向

- 接入真实资料下载。
- 接入飞书表单或腾讯问卷。
- 增加后台管理。
- 增加用户收藏。
- 增加下载统计。
- 增加 SEO sitemap 自动生成。
- 增加结构化数据。
- 增加微信二维码。
- 增加广告管理。
- 增加付费资料包页面。
- 增加作文批改订单入口。
- 增加学习诊断自动生成结果。
- 增加 AI 学习计划生成器。

## 合规注意事项

- 优先原创资料。
- 不上传未授权教辅、机构讲义、学校未授权材料。
- 不承诺固定考试结果。
- 不使用夸大资料来源或暗示特殊渠道等宣传。
- 收集用户信息前必须明确告知用途。
- 涉及广告、合作推荐或付费服务时，应清楚标注。
- 用户提交联系方式前，应能看到隐私政策或用途说明。
- 未成年人信息应由监护人同意后提交。

## 版权说明

© 2026 成都中考英语加油站。保留所有权利。

本站内容仅供学习参考，请结合学校要求、老师建议和学生个人情况使用。

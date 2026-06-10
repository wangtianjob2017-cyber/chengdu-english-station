# 在线后台配置说明

这个目录用于 Decap CMS 在线后台。

后台入口：

```text
/admin/
```

## 当前文件

- `index.html`：加载 Decap CMS。
- `config.yml`：后台字段、数据文件、媒体上传和 GitHub 后端配置。

## 上线前必须替换

请打开 `admin/config.yml`，替换以下占位：

```yaml
repo: wangtianjob2017-cyber/chengdu-english-station
base_url: https://YOUR-OAUTH-PROXY-DOMAIN
site_url: https://wangtianjob2017-cyber.github.io/chengdu-english-station/
display_url: https://wangtianjob2017-cyber.github.io/chengdu-english-station/
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

# Supabase 后端运维管理完全指南 🐘

这份指南涵盖了咱们“独立开发者画廊”项目（包含静态网站、软件发布、Drawio 架构图纸）在 Supabase 上所有的数据库表结构、核心对象存储运维以及常见问题排查技巧。

---

## 🔑 核心接入信息

- **网页控制台大本营**: [https://app.supabase.com/](https://app.supabase.com/) （日常管理、建表、看数据的首选工具）。
- **当前绑定的项目 ID**: `lcrpvoothmyyqzzzmrir`
- **环境变量位置**: 项目根目录下的 `.env` 文件（包含 `NEXT_PUBLIC_SUPABASE_URL` 及 `..._ANON_KEY`）。*注意不要将这些信息，尤其是 `SERVICE_ROLE_KEY`，推送到公开的 Github 仓库中。*

---

## 📦 对象存储管理 (Storage)

我们的画廊不仅展示图片，还要存放大体积的“软件安装包”和“Drawio 源文件”。它们并不需要占据你服务器自身的硬盘，而是托付给了 Supabase Storage 引擎。

### 必建公共存储桶 (Buckets)
如果你在后台点击“⬆️ 云上传”报错说没有权限，请务必前往 Supabase 控制台的 **Storage** 菜单，分别创建并配置如下两个桶：

1. `drawio` : 存放 `.xml` 和 `.drawio` 图纸文件。
2. `software_assets` : 存放 `.exe`, `.dmg`, `.zip` 等软件发布安装包。

🚨 **致命易错点：**
- **必须开启对外可见**：在创建桶的时候，**务必勾选 “Public bucket”** 开关！如果不小心忘记了，请在 Storage 列表选中你的桶图标旁边的 `...` 菜单，点击 `Make Public`。
- **文件直推与 Caddy 代理体系**：后台面板上传完这些文件后，原本会生成极长的海外下载直链（`https://lcr...supabase.co/storage/v1/object/public/...`）。得益于前台智适应代码以及你配置好的 Caddy 系统，所有被展示给国内普通用户的链接都会被自动缩骨为 `https://inspirejoy.cn/storage/软件名.exe`，从而享受无脑国内直链满血加速满宽带！

*(如需了解国内网络如何被 Caddy 透明加速反代的详情，请翻阅当前同目录的 `Caddy_Management_Guide.md` 文档。)*

---

## 🗄️ 数据库表盘图 (Schema & Polymorphism)

本页面项目突破了原本只存干瘪数据的设计，依靠一套非常优雅的**单表多态架构 (Single-Table Polymorphism)** 实现了对三大资源类型的混排管理。

### 核心表: `public.projects`
我们只加了两个扩展字段，让原本的表变得神通广大。

| 字段名称 | 数据类型 | 描述说明 |
| :--- | :--- | :--- |
| `id` | uuid/text | 自动生成的唯一标识 |
| `title`, `description`| text | 标题与长说明 |
| `category` | text | 用于前台画廊大类划分 (`Work`, `Life`, `Learning`, `IT`) |
| `tags` | text[] | 关联的多维独立标签流（形如 `['React', 'Vite']`） |
| `project_type` 🌟 | text | **用于区分到底是什么项目**：可选值为 `website`（网站外链）、`software`（软件APP）、`drawio`（大图纸） |
| `metadata` 🌟 | jsonb | **多态核心数据装载区**：由于不同类型的属性大不相同，全部扔在 JSONB 里。<br>- *软件里有*：`{"macos":"URL...", "windows":"URL...", "latestVersion":"v1.2", "repoUrl": "github"}`<br>- *Drawio图有*：`{"fileUrl":"XML直链"}` |

### 如何打数据库更新补丁 (SQL Editor)？
当项目未来再次升级，且我要你跑一份以 `.sql` 结尾的脚本时（如 `db_update_software.sql` 这种追加脚本）：
1. 在网页主面板点击左侧第四个深蓝色的菜单 `SQL Editor`。
2. 点右上角的 `New Query`。
3. 把咱们本地准备好的那份 SQL 代码无脑全粘进去，点 `Run` 即可。比起命令行和各类 CLI 工具，网页版有着独树一帜的防错能力及反馈。

---

## 🔧 常见问题排查与避坑 (FAQ)

**1. Q: 前端点击“退出登录”后，我忘了登录密码，怎么进去啊？**
**A:** 打开 Supabase -> **Authentication** (身份验证) -> **Users** 菜单。直接找到你的魔法管理员邮箱地址，点击右侧的选项直接发送重置邮件。

**2. Q: 控制台后台新建/上传报错时提示 "Row level security (RLS)" 的拦截？**
**A:**  Supabase 默认会锁死表。因为我们是用自己的私人 Token 进行操作的管理员应用，所以你需要确认两个方面：
   - 检查你当前访问 Admin 面板确实登录成功了。
   - 这套全栈画廊的代码通过 `supabase.auth` 做权限校验。如果项目未来开放部分接口供别人用你的鉴权通道上传，就去表设置里添加 `RLS Policies` (允许通过认证的用户向某表或某桶 Insert 的权限即可)。

**3. Q: 这个项目的源数据被我不小心的操作删了个精光，怎么找回它？**
**A:** 在建表时，强烈建议你以后每隔半年去 Supabase 面板里的 `Database -> Backups` 检查一下快照设置，或者利用 Supabase 的 `CSV Export` 功能从 Table Editor 面板随时将重要项目的 JSON 和文本行导出来备份在本地。

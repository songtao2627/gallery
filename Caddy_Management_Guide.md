# Caddy v2 生产环境运维管理指南

这是针对 `inspirejoy.cn` 的定制版 Caddy 反向代理系统管理维护手册，内容基于你独有的 React SPA 宿主环境和 Supabase 直链代理架构编写。

---

## 🏗️ 核心要素速览

- **配置主文件:** `/etc/caddy/Caddyfile` （全局环境配置所在地）
- **日志与证书卷:** `/var/lib/caddy/.local/share/caddy` （含自动获取的 SSL Pem 和 Key）
- **Caddy 二进制可执行文件:** `/usr/bin/caddy` (Caddy 是 Go 语言单文件，不产生依赖包碎片)

---

## ⚡ 常用高频指令清单

Caddy 由于采用原生 Systemd 守护，因此全生命周期依赖以下指令。**请通过远程连入你的 CentOS/Ubuntu 终端执行：**

### 1. 验证配置文件语法 (上线生命线)
在改动服务器端 `/etc/caddy/Caddyfile` 后，**务必先验证**语法是否合法：
```bash
caddy validate --config /etc/caddy/Caddyfile
```
*💡 如果输出 `Valid configuration` 即代表语法过关，随时可以载入。*

### 2. 热重载系统 (Zero-Downtime Reload)
由于使用平滑重载（Reload），就算有上万个人在下载你的画廊大文件，连接哪怕长达几小时也不会被切断。
```bash
sudo systemctl reload caddy
```

### 3. 日常启停控制
```bash
sudo systemctl status caddy    # 查看进程树和近期10行核心日志 (极为关键)
sudo systemctl start caddy     # 启动
sudo systemctl stop caddy      # 停止
sudo systemctl restart caddy   # 强制重启（暴力杀掉未完成的请求）
```

### 4. 实时追踪日志 (Troubleshooting)
当你遇到代理访问报 `502 Bad Gateway` 或者 `404 Not Found` 时：
```bash
sudo journalctl -u caddy -f --no-pager
```

---

## 🧭 当前路由架构拆解解析

由于你的 `Caddyfile` 当前由三大策略组成了极为稳健的静态分发防线，这里详细科普其中的运行机制，让你遇到问题能快速排查：

### 策略 A：子挂载应用 (`handle_path /app/*`)
```caddyfile
    handle_path /app/* {
        root * /www/wwwroot/ij/apps
        file_server
    }
```
**原理**：`handle_path` 是 Caddy 内置的“剥离式路由器”。当客户端访问 `/app/pdv1/...` 时，Caddy 会悄悄地把 `/app/` 这个剥去，然后拿着剩下的 `pdv1/...` 去 `/www/wwwroot/ij/apps` 文件夹里寻找。
**用途**：极度适合你在这里无限挂载新的实验小 Demo（例如放进去 `apps/demo1` 文件夹就能被访问到）。

### 策略 B：Supabase 数据桥接隧道 (`handle_path /storage/*`)
```caddyfile
    handle_path /storage/* {
        rewrite * /storage/v1/object/public{path}
        reverse_proxy https://lcrpvoothmyyqzzzmrir.supabase.co {
            header_up Host lcrpvoothmyyqzzzmrir.supabase.co
            flush_interval -1
        }
    }
```
**原理**：这是一套天衣无缝的伪装技术。
1. `handle_path /storage/*`：把用户发来的 `/storage/` 剥离。
2. `rewrite`：立刻给刚才剥离掉的路径打上超难看、巨长的 Supabase 官配目录补丁（`/storage/v.../{path}`）。
3. `reverse_proxy` 后跟具体的上游。同时用 `header_up Host` 欺骗 Supabase 的前端网关（让它以为这是自己在访问自己），由于关闭了 `flush_interval`，所以你的 Caddy 不会去强行积压、缓冲画廊大图及几十兆的视频、软件文件，而是用流 (stream) 边下边给国内用户，不卡你云服务器自身的内存。

### 策略 C：SPA / React 的绝对护城河 (兜底策略 `handle`)
```caddyfile
    # 它没有任何约束，意味着 Caddy 会把前两步不匹配的一切都扔进此处
    handle {
        root * /www/wwwroot/ij
        try_files {path} /index.html
        file_server
    }
```
**原理**：单页应用（例如我们画面的根路由项目）的核心所在。
假设用户访问你画廊内部的 `https://inspirejoy.cn/admin` （后台控制单页），而你的云服务器磁盘上由于是 React 项目，压根不存在有个叫 `admin` 的 HTML 文件夹。
如果没有 `try_files {path} /index.html`，Caddy 会无情地抛出 `404`。但加了这句，它检查到没这个文件，就会强制渲染 `/index.html` 并借由 React-Router 在前端渲染后台画面。

---

## 🚫 典型故障应急响应预案 (FAQ)

**1. Q: 修改完重启，但是出现 `tcp: bind: address already in use` 启动失败？**
**A:** 代表你有另一个进程（如曾经部署的 nginx / apache）占用了 80 或 443 端口。用 `sudo netstat -tlpn | grep 80` 找出它并杀掉 (`kill -9 PID`)。

**2. Q: 用户访问 `/storage/软件资源`，报错 502/SSL 手牌错误？**
**A:** 这大概率是因为 Supabase 更换了内部路由或者防火墙屏蔽了你的云服务器网段 IP，或者是你的 `header_up Host` 配置单词漏写。请首先通过 `curl -I https://lcrpvoothmyyqzzzmrir.supabase.co` 检查服务器到 Supabase 之间的国际连通性是否正常。

**3. Q: 自动 HTTPS 签发经常报错失败咋办？**
**A:** 如果你没有备案被域名强阻，或是 DNS 解析不到位。只需确保你的 A 记录准时指向服务器 IP，Caddy 会不断轮询直至拿到证书，并且是全自动续期的，**千万不要随意手搓重置证书库**，这反而会触发 Let's Encrypt 的发证熔断期限制。

#!/usr/bin/env bash
# install-mcp-servers.sh
# Installs/registers a set of MCP servers for Claude Code.
# macOS/Linux. For Windows, use a .bat/.ps1 and adapt commands (e.g., prepend "cmd /c" before npx).

set -euo pipefail

echo "🔧  Installing Claude MCP servers (latest versions)…"

# Sequential Thinking — Claude's chain-of-thought engine
claude mcp add sequential-thinking -s user \
  -- npx -y @modelcontextprotocol/server-sequential-thinking || true

# Playwright — modern multi‑browser automation
claude mcp add playwright -s user \
  -- npx -y @playwright/mcp-server || true

# Fetch — simple HTTP GET/POST
claude mcp add fetch -s user \
  -- npx -y @kazuph/mcp-fetch || true

# Browser‑Tools — DevTools logs, screenshots, etc.
claude mcp add browser-tools -s user \
  -- npx -y @agentdeskai/browser-tools-mcp || true

# Chrome DevTools MCP — alternative DevTools integration
claude mcp add chrome-devtool -s user \
  -- npx -y chrome-devtools-mcp@latest || true

# shadcn MCP — exposes shadcn tooling via MCP
claude mcp add shadcn -s user \
  -- npx -y shadcn@latest mcp || true

# Exa MCP (HTTP) — remote MCP via SSE/HTTP
claude mcp add exa -s user \
  --type http \
  --url https://mcp.exa.ai/mcp || true

# Convex MCP — exposes Convex CLI via MCP over stdio
claude mcp add convex -s user \
  -- npx -y convex@latest mcp start || true

# Context7 MCP — stdio via npx, no API key
claude mcp add context7 -s user \
  -- npx -y context7-mcp || true

echo "--------------------------------------------------"
echo "✅  MCP registration finished."
echo ""
echo "🔴  To enable Browser‑Tools, run this in a second terminal and leave it open:"
echo "    npx -y @agentdeskai/browser-tools-server"
echo "--------------------------------------------------"
claude mcp list

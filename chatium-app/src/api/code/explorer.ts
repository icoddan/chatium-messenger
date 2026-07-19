// @shared
import { requireAccountRole } from "@app/auth"
import CodeFiles from "../../tables/code_files.table"

export const codeExplorerRoute = app.post("/")
  .body(s => ({ path: s.string().optional().default(""), filePath: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Admin")
    const targetPath = req.body.path ?? ""
    const targetFilePath = req.body.filePath
    if (targetFilePath) {
      const file = await CodeFiles.findOneBy(ctx, { path: targetFilePath })
      if (!file) return { success: false, error: "File not found" }
      const ext = (file.name.match(/\.([^.]+)$/)?.[1] || "").toLowerCase()
      const langMap = { ts: "typescript", tsx: "typescript", vue: "vue", js: "javascript", json: "json", yml: "yaml", yaml: "yaml", md: "markdown", css: "css", html: "html", table: "typescript" }
      return { success: true, type: "file", name: file.name, path: file.path, content: file.content, language: langMap[ext] || "plaintext", size: file.content?.length ?? 0 }
    }
    const allFiles = await CodeFiles.findAll(ctx, {})
    if (targetPath === "" || targetPath === "/") {
      const rootDirs = new Set<string>(); const rootFiles: { path: string; name: string }[] = []
      for (const f of allFiles) {
        const parts = f.path.split("/")
        if (parts.length === 1) rootFiles.push(f)
        else if (parts[0]) rootDirs.add(parts[0])
      }
      const dirs = Array.from(rootDirs).sort().map(n => ({ name: n, path: n, type: "directory" as const }))
      const files = rootFiles.sort((a, b) => a.name.localeCompare(b.name)).map(f => ({ name: f.name, path: f.path, type: "file" as const }))
      return { success: true, type: "directory", name: "/", path: "/", items: [...dirs, ...files], itemCount: dirs.length + files.length }
    }
    const prefix = targetPath.endsWith("/") ? targetPath : targetPath + "/"
    const childPrefixes = new Set<string>(); const childFiles: { path: string; name: string }[] = []
    for (const f of allFiles) {
      if (f.path.startsWith(prefix)) {
        const rel = f.path.slice(prefix.length)
        if (rel.includes("/")) { const dn = rel.split("/")[0]; if (dn) childPrefixes.add(dn) }
        else if (rel) childFiles.push(f)
      }
    }
    const dirs = Array.from(childPrefixes).sort().map(n => ({ name: n, path: prefix + n, type: "directory" as const }))
    const files = childFiles.sort((a, b) => a.name.localeCompare(b.name)).map(f => ({ name: f.name, path: f.path, type: "file" as const }))
    return { success: true, type: "directory", name: targetPath.split("/").pop() || targetPath, path: targetPath, items: [...dirs, ...files], itemCount: dirs.length + files.length }
  })
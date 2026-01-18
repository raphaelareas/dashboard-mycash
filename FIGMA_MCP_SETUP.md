# Configuração do Figma MCP para Cursor

## 🎯 Objetivo
Este guia ajuda a configurar a conexão do Figma MCP (Model Context Protocol) com o Cursor IDE.

---

## 📋 Pré-requisitos

1. **Figma Desktop App** instalado e atualizado (versão mais recente)
2. **Conta Figma** com Dev Seat ou Full Seat (necessário para MCP)
3. **Cursor IDE** instalado e funcionando

---

## 🔧 Passo a Passo

### 1. Habilitar MCP Server no Figma Desktop

1. **Abra o Figma Desktop**
2. **Abra o arquivo de design** que você quer usar (ex: `Workshop---Do-figma-MCP-ao-Cursor-AI-v.2--Community-`)
3. **Ative o Dev Mode**:
   - Atalho: `Shift + D`
   - Ou pelo toolbar inferior (ícone de código)
4. **Habilite o MCP Server**:
   - No painel de inspeção direito (inspect panel)
   - Procure pela seção "MCP server"
   - Clique para **habilitar**
   - **Copie a URL** do servidor local (geralmente: `http://127.0.0.1:3845/mcp`)

**Alternativa - Remote Server:**
- URL: `https://mcp.figma.com/mcp`
- Não requer Figma Desktop rodando
- Mais lento, mas funciona de qualquer lugar

---

### 2. Configurar MCP no Cursor

#### Opção A: Via Configurações do Cursor (Recomendado)

1. Abra o Cursor IDE
2. Vá em **Settings** (Cmd/Ctrl + ,)
3. Procure por **"MCP"** ou **"Model Context Protocol"**
4. Adicione um novo servidor MCP:

**Para Local Server (Desktop):**
```json
{
  "name": "figma",
  "url": "http://127.0.0.1:3845/mcp",
  "type": "http"
}
```

**Para Remote Server:**
```json
{
  "name": "figma",
  "url": "https://mcp.figma.com/mcp",
  "type": "http"
}
```

5. **Salve** as configurações
6. **Reinicie o Cursor** se necessário

#### Opção B: Via arquivo de configuração

O Cursor pode usar um arquivo de configuração MCP. Normalmente em:
- `~/.cursor/mcp.json` (macOS/Linux)
- `%APPDATA%/Cursor/mcp.json` (Windows)

Crie ou edite este arquivo com:

```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "url": "http://127.0.0.1:3845/mcp",
      "type": "http"
    }
  }
}
```

---

### 3. Autenticação

1. Quando o Cursor tentar conectar ao Figma MCP pela primeira vez
2. Você será redirecionado para autenticação OAuth do Figma
3. **Autorize** o Cursor a acessar seus designs
4. A conexão será estabelecida

---

### 4. Testar a Conexão

Para verificar se está funcionando:

1. No Cursor, tente usar o Figma MCP com um prompt como:
   ```
   @figma get_design_context
   ```
   
2. Ou mencione um componente/layer do Figma e peça para:
   ```
   Analise este frame do Figma e me mostre as variáveis CSS
   ```

3. Se funcionar, você verá dados do Figma sendo carregados

---

## 🔍 Verificação de Problemas

### MCP não está funcionando?

1. **Verifique se o Figma Desktop está rodando** (se usar servidor local)
2. **Verifique se o Dev Mode está ativo** no Figma
3. **Confirme que a URL do servidor está correta**
4. **Verifique as permissões da conta Figma** (precisa de Dev Seat ou Full Seat)
5. **Reinicie o Cursor** após configurar

### URLs comuns:

- **Local (Desktop)**: `http://127.0.0.1:3845/mcp`
- **Remote**: `https://mcp.figma.com/mcp`

---

## 📚 Referências

- [Documentação oficial do Figma MCP](https://developers.figma.com/docs/figma-mcp-server/)
- [Guia do Figma MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)

---

## 🆘 Suporte

Se ainda não funcionar após seguir estes passos:

1. Verifique os logs do Cursor (View > Output > MCP)
2. Confirme que você tem acesso ao arquivo Figma (permissões)
3. Tente usar o servidor remoto se o local não funcionar

# 📚 Tutorial: Como fazer Push para o GitHub

## ✅ Status Atual

- **Repositório local:** Configurado ✅
- **Commit local:** Criado ✅ (hash: 1e1c828)
- **Branch atual:** `dev` ✅
- **Remote:** `origin` → `https://github.com/raphaelareas/dashboard-mycash.git`

---

## 🎯 Opção 1: Push com Personal Access Token (Recomendado)

### Passo 1: Criar Personal Access Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Configure o token:
   - **Note:** `Dashboard MyCash - Local Development`
   - **Expiration:** Escolha um prazo (90 dias, 1 ano, etc.)
   - **Scopes:** Marque pelo menos:
     - ✅ `repo` (acesso completo aos repositórios)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN AGORA** (você só verá ele uma vez!)

### Passo 2: Fazer o Push

Abra o Terminal e execute:

```bash
cd "/Users/raphaelareas/Documents/Dashboard MyCash FigmaMCP"
git push -u origin dev
```

Quando solicitar credenciais:
- **Username:** `raphaelareas`
- **Password:** Cole o Personal Access Token (não use sua senha do GitHub!)

---

## 🔐 Opção 2: Usar SSH (Mais Seguro - Recomendado para longo prazo)

### Passo 1: Verificar se você já tem uma chave SSH

```bash
ls -la ~/.ssh
```

Se você ver arquivos como `id_rsa.pub` ou `id_ed25519.pub`, pule para o Passo 3.

### Passo 2: Gerar nova chave SSH

```bash
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
```

- Pressione Enter para aceitar o local padrão
- (Opcional) Digite uma senha para proteger a chave
- Confirme a senha

### Passo 3: Adicionar chave SSH ao ssh-agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Passo 4: Copiar a chave pública

```bash
cat ~/.ssh/id_ed25519.pub
```

Ou use:

```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

### Passo 5: Adicionar chave no GitHub

1. Acesse: https://github.com/settings/keys
2. Clique em **"New SSH key"**
3. **Title:** `MacBook - Dashboard MyCash`
4. **Key:** Cole a chave que você copiou
5. Clique em **"Add SSH key"**

### Passo 6: Alterar remote para SSH

```bash
cd "/Users/raphaelareas/Documents/Dashboard MyCash FigmaMCP"
git remote set-url origin git@github.com:raphaelareas/dashboard-mycash.git
git remote -v  # Verificar se mudou
```

### Passo 7: Testar conexão SSH

```bash
ssh -T git@github.com
```

Você deve ver: `Hi raphaelareas! You've successfully authenticated...`

### Passo 8: Fazer o Push

```bash
git push -u origin dev
```

---

## 🔑 Opção 3: Usar GitHub CLI (Mais Fácil)

### Passo 1: Instalar GitHub CLI (se ainda não tiver)

```bash
brew install gh
```

### Passo 2: Fazer login

```bash
gh auth login
```

Siga as instruções:
- Escolha `GitHub.com`
- Escolha `HTTPS` ou `SSH`
- Escolha `Login with a web browser`
- Copie o código e cole no navegador
- Autorize o acesso

### Passo 3: Fazer o Push

```bash
cd "/Users/raphaelareas/Documents/Dashboard MyCash FigmaMCP"
git push -u origin dev
```

---

## 🛠️ Opção 4: Configurar Credenciais no macOS Keychain

### Passo 1: Configurar Git para usar Keychain

```bash
git config --global credential.helper osxkeychain
```

### Passo 2: Fazer Push (pedirá credenciais uma vez)

```bash
cd "/Users/raphaelareas/Documents/Dashboard MyCash FigmaMCP"
git push -u origin dev
```

Digite:
- **Username:** `raphaelareas`
- **Password:** Seu Personal Access Token

O macOS salvará as credenciais no Keychain para próximas vezes.

---

## ❓ Solução de Problemas

### Erro: "fatal: could not read Username"

**Solução:** Use uma das opções acima para configurar autenticação.

### Erro: "Permission denied (publickey)"

**Solução:** Use a Opção 2 (SSH) ou verifique se adicionou a chave SSH ao GitHub.

### Erro: "remote: Invalid username or password"

**Solução:** Certifique-se de usar Personal Access Token, não sua senha do GitHub.

### Erro: "src refspec dev does not match any"

**Solução:** Certifique-se de estar na branch `dev`:
```bash
git branch
git checkout dev
```

---

## 📋 Comandos Úteis para Verificar

```bash
# Ver remote configurado
git remote -v

# Ver branch atual
git branch

# Ver status
git status

# Ver último commit
git log --oneline -1

# Ver histórico de commits
git log --oneline -5
```

---

## ✅ Após o Push Bem-Sucedido

Você verá algo como:
```
Enumerating objects: 93, done.
Counting objects: 100% (93/93), done.
Delta compression using up to X threads
Compressing objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), XXX KiB | XXX.XXX MiB/s, done.
Total XX (delta XX), reused XX (delta XX), pack-reused 0
remote: Resolving deltas: 100% (XX/XX), done.
To https://github.com/raphaelareas/dashboard-mycash.git
 * [new branch]      dev -> dev
Branch 'dev' set up to track remote branch 'dev' from 'origin'.
```

---

## 🎉 Pronto!

Seu código estará disponível em:
**https://github.com/raphaelareas/dashboard-mycash/tree/dev**

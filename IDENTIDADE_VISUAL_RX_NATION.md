# 🎨 Identidade Visual RX Nation

Guia completo de identidade visual e assets da marca RX Nation.

---

## 📦 Pacote Completo de Assets

### Logo Principal
- **Arquivo:** `/client/public/logo-rx-nation-final.png`
- **Formato:** PNG com fundo azul
- **Uso:** Logo principal da plataforma (sidebar, header, branding geral)
- **Dimensões:** 1024x1024px

### Ícones PWA (Progressive Web App)
- **icon-192.png** - Ícone 192x192px para PWA e Android
- **icon-512.png** - Ícone 512x512px para PWA e app stores
- **Uso:** Home screen de dispositivos móveis, splash screens

### Favicons (Navegador)
- **favicon.ico** - Multi-resolução (16x16, 32x32)
- **favicon-16.png** - 16x16px para abas do navegador
- **favicon-32.png** - 32x32px para barra de favoritos
- **favicon-48.png** - 48x48px para atalhos
- **Uso:** Abas do navegador, favoritos, atalhos da área de trabalho

### Variações do Logo

#### Logo Horizontal
- **Arquivo:** `/client/public/logo-horizontal.png`
- **Formato:** Landscape (RX + NATION lado a lado)
- **Uso:** Email headers, assinaturas, banners largos, documentos

#### Logo Vertical
- **Arquivo:** `/client/public/logo-vertical.png`
- **Formato:** Portrait (RX empilhado sobre NATION)
- **Uso:** Banners verticais, stories do Instagram, materiais impressos verticais

#### Logo Monocromático
- **Arquivo:** `/client/public/logo-monochrome.png`
- **Formato:** Preto e branco
- **Uso:** Impressão monocromática, documentos oficiais, carimbos, merchandising

---

## 🎨 Paleta de Cores

### Cores Primárias
- **Azul Elétrico:** `#0066CC` / `rgb(0, 102, 204)`
- **Azul Claro:** `#1E90FF` / `rgb(30, 144, 255)`
- **Azul Escuro:** `#003366` / `rgb(0, 51, 102)`

### Cores Secundárias
- **Branco:** `#FFFFFF` / `rgb(255, 255, 255)`
- **Preto:** `#000000` / `rgb(0, 0, 0)`

### Gradientes
- **Gradiente Principal:** Linear de `#0066CC` para `#1E90FF`
- **Uso:** Backgrounds, cards, elementos de destaque

---

## 📐 Tipografia

### Fonte Principal: **Oswald**
- **Uso:** Títulos, headers, branding
- **Pesos:** 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700`

### Fonte Secundária: **Inter**
- **Uso:** Corpo de texto, parágrafos, UI
- **Pesos:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700`

---

## 📱 Aplicações da Marca

### Digital
- ✅ Website/PWA
- ✅ Favicon do navegador
- ✅ Ícone de app móvel (iOS/Android)
- ✅ Cards compartilháveis (Instagram/Facebook)
- ✅ Email marketing
- ✅ Assinaturas de email

### Impressão
- ✅ Documentos oficiais (usar logo monocromático)
- ✅ Materiais promocionais
- ✅ Camisetas e merchandising
- ✅ Banners e cartazes

### Social Media
- ✅ Posts do Instagram (usar logo vertical para stories)
- ✅ Capa do Facebook (usar logo horizontal)
- ✅ Avatar de perfis (usar icon-512.png)

---

## 🔧 Implementação Técnica

### HTML (index.html)
```html
<!-- Favicons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" href="/icon-192.png" />

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0066CC" />
<meta name="apple-mobile-web-app-title" content="RX Nation" />
```

### Manifest.json (PWA)
```json
{
  "name": "RX Nation",
  "short_name": "RX Nation",
  "description": "RX Nation - Plataforma completa de gestão e gamificação para boxes de CrossFit",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0066CC",
  "background_color": "#0a0a0a"
}
```

### React/TypeScript (const.ts)
```typescript
export const APP_TITLE = "RX Nation";
export const APP_LOGO = "/logo-rx-nation-final.png";
```

---

## 📋 Checklist de Branding

### ✅ Completo
- [x] Logo principal criado
- [x] Ícones PWA (192x192, 512x512)
- [x] Favicons multi-resolução
- [x] Logo horizontal
- [x] Logo vertical
- [x] Logo monocromático
- [x] Atualização de todas as referências no código
- [x] Meta tags e SEO
- [x] PWA manifest
- [x] Cards FIFA compartilháveis
- [x] Onboarding atualizado

### 🎯 Próximas Melhorias Sugeridas
- [ ] Criar templates de email marketing
- [ ] Criar templates de posts para Instagram
- [ ] Criar mockups de merchandising (camisetas, squeezes, etc)
- [ ] Criar apresentação institucional (slides)
- [ ] Criar manual de identidade visual completo (PDF)

---

## 📞 Uso e Licenciamento

Todos os assets da marca RX Nation são propriedade exclusiva do projeto e devem ser usados apenas para fins relacionados à plataforma RX Nation.

**Não permitido:**
- ❌ Modificar as cores do logo
- ❌ Distorcer ou redimensionar desproporcionalmente
- ❌ Adicionar efeitos ou sombras não autorizados
- ❌ Usar em contextos que possam prejudicar a marca

**Permitido:**
- ✅ Usar em materiais oficiais da RX Nation
- ✅ Compartilhar em redes sociais com atribuição
- ✅ Imprimir em materiais promocionais autorizados
- ✅ Usar em apresentações e documentos internos

---

## 📁 Estrutura de Arquivos

```
client/public/
├── logo-rx-nation-final.png      # Logo principal
├── logo-horizontal.png            # Logo horizontal
├── logo-vertical.png              # Logo vertical
├── logo-monochrome.png            # Logo monocromático
├── icon-192.png                   # PWA icon 192x192
├── icon-512.png                   # PWA icon 512x512
├── favicon.ico                    # Favicon multi-resolução
├── favicon-16.png                 # Favicon 16x16
├── favicon-32.png                 # Favicon 32x32
└── favicon-48.png                 # Favicon 48x48
```

---

## 🎨 Exemplos de Uso

### Cards FIFA Compartilháveis
Os cards gerados pela plataforma já utilizam o branding RX Nation:
- Header: "RX" / "NATION"
- Cores: Gradiente azul elétrico
- Tipografia: Oswald Bold

### Onboarding
O tour de boas-vindas exibe:
- Título: "Bem-vindo à RX Nation! 💪"
- Logo no canto superior esquerdo
- Cores da marca em toda a interface

---

**Versão:** 1.0  
**Data:** Novembro 2025  
**Criado por:** Manus AI  
**Plataforma:** RX Nation CrossFit Management System

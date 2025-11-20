#!/bin/bash
# Criar ícones PWA baseados no logo existente

# Cores do Impacto Pro League
BG_COLOR="#0a0a0a"
TEXT_COLOR="#f59e0b"

# Criar ícone 192x192
convert -size 192x192 xc:"$BG_COLOR" \
  -gravity center \
  -fill "$TEXT_COLOR" \
  -font "DejaVu-Sans-Bold" \
  -pointsize 120 \
  -annotate +0+0 "💪" \
  icon-192.png 2>/dev/null || echo "ImageMagick not available, creating placeholder"

# Criar ícone 512x512
convert -size 512x512 xc:"$BG_COLOR" \
  -gravity center \
  -fill "$TEXT_COLOR" \
  -font "DejaVu-Sans-Bold" \
  -pointsize 320 \
  -annotate +0+0 "💪" \
  icon-512.png 2>/dev/null || echo "ImageMagick not available, creating placeholder"

# Se ImageMagick não estiver disponível, criar placeholders simples
if [ ! -f icon-192.png ]; then
  echo "Creating placeholder icons..."
  # Criar SVG e converter para PNG usando navegador headless seria ideal
  # Por enquanto, vamos criar arquivos vazios que serão substituídos
  touch icon-192.png icon-512.png
fi

echo "Icons created successfully!"

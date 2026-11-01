#!/bin/zsh
# Ebeveyn bu dosyayı çalıştırdığında yalnızca bu oyunu doğrudan main'e gönderir.
set -eu
cd "$(dirname "$0")"
python3 tools/liste.py
game_root="$PWD"
repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ "$repo_root" != "$game_root" ]]; then
  git init -b main
fi
git config user.name 'goktugkarpat'
git config user.email 'goktugkarpat@users.noreply.github.com'
if [[ "$(git branch --show-current)" != 'main' ]]; then
  print 'Yayımlamak için önce main dalına geçmelisin.'
  exit 1
fi
command -v gh >/dev/null 2>&1 || { print 'GitHub CLI (gh) gerekli. Önce gh aracını kurmalısın.'; exit 1; }
gh auth status >/dev/null 2>&1 || gh auth login --hostname github.com --git-protocol https --web
if [[ "$(gh api user --jq .login)" != 'goktugkarpat' ]]; then
  print 'Gönderim için aktif GitHub hesabı goktugkarpat olmalı.'
  exit 1
fi
git add -A
git update-index --chmod=+x yayinla.command
if ! git diff --cached --quiet; then
  git commit -m "Feza ve Pırıl: Kayıp Işıklar – güncelleme $(date '+%Y-%m-%d %H:%M')" -m 'Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>'
fi
if ! git remote get-url origin >/dev/null 2>&1; then
  if gh repo view goktugkarpat/feza-piril-3d-arpg >/dev/null 2>&1; then
    git remote add origin https://github.com/goktugkarpat/feza-piril-3d-arpg.git
    git push -u origin main
  else
    gh repo create goktugkarpat/feza-piril-3d-arpg --public --source . --remote origin --push \
      --description 'Feza ve Pırıl: sönen Büyük Fener için on diyarda ışık arayan Türkçe seslendirmeli 3B rüya macerası (5 yaş).'
  fi
else
  git push -u origin main
fi
if ! gh api repos/goktugkarpat/feza-piril-3d-arpg/pages >/dev/null 2>&1; then
  gh api -X POST repos/goktugkarpat/feza-piril-3d-arpg/pages -f 'source[branch]=main' -f 'source[path]=/' >/dev/null
fi
print 'Oyun gönderildi: https://goktugkarpat.github.io/feza-piril-3d-arpg/'
print 'İlk yayın birkaç dakika sürebilir.'

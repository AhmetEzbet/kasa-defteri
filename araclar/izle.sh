#!/usr/bin/env bash
# Son "Mobil uygulamalar" derlemesini bitene kadar bekler, en fazla 5 satır özet basar.
# Kullanım: araclar/izle.sh [run_id] [azami_dakika]
R=${1:-$(gh run list -R AhmetEzbet/kasa-defteri -L1 -w mobil.yml --json databaseId -q '.[0].databaseId')}
SON=$(( $(date +%s) + ${2:-25}*60 ))
while :; do
  D=$(gh api repos/AhmetEzbet/kasa-defteri/actions/runs/$R -q .status)
  [ "$D" = completed ] || [ $(date +%s) -ge $SON ] && break
  sleep 30
done
gh api repos/AhmetEzbet/kasa-defteri/actions/runs/$R/jobs -q '.jobs[]|"\(.name): \(.status) \(.conclusion // "")"'
J=$(gh api repos/AhmetEzbet/kasa-defteri/actions/runs/$R/jobs -q '.jobs[]|select(.name|test("iOS"))|.id')
[ -n "$J" ] && gh api repos/AhmetEzbet/kasa-defteri/actions/jobs/$J/logs 2>/dev/null \
  | grep -E "Eşleşen|eşleşmedi|EXPORT|UPLOAD|error:|Uploaded|not acquired" | cut -c30-130 | sort -u | head -2

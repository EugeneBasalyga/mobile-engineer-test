#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "$0")/../kit/fixtures" && pwd)"
files=(statement.csv statement.pdf spoofed.pdf oversize.csv)

if command -v adb >/dev/null && adb get-state >/dev/null 2>&1; then
  for file in "${files[@]}"; do adb push "$fixtures/$file" /sdcard/Download/ >/dev/null; done
  echo "Android: Downloads"
fi

if xcrun simctl get_app_container booted com.apple.DocumentsApp groups >/dev/null 2>&1; then
  group="$(xcrun simctl get_app_container booted com.apple.DocumentsApp groups | awk '/LocalStorage/ {print $2}')"
  mkdir -p "$group/File Provider Storage"
  for file in "${files[@]}"; do cp "$fixtures/$file" "$group/File Provider Storage/"; done
  echo "iOS: Files > Browse > On My iPhone"
fi

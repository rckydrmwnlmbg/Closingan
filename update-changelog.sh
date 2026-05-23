#!/bin/bash
sed -i 's/- \[ \] ⏳ TASK 6.2 — Dashboard UI/- \[x\] ✅ TASK 6.2 — Dashboard UI/' Docs/CHANGELOG.md

DATE=$(date +"%d %b %Y")
if grep -q "### $DATE" Docs/CHANGELOG.md; then
  sed -i "/### $DATE/a - ✅ TASK 6.2 — Dashboard UI" Docs/CHANGELOG.md
else
  sed -i "/## LOG PERUBAHAN/a \\
\\
### $DATE\\
- ✅ TASK 6.2 — Dashboard UI" Docs/CHANGELOG.md
fi

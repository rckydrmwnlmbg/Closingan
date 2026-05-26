import re

with open('Docs/CHANGELOG.md', 'r') as f:
    content = f.read()

content = content.replace("- [ ] TASK 7.3 — Error Handling & Graceful Degradation", "- [x] ✅ TASK 7.3 — Error Handling & Graceful Degradation")
content = content.replace("- [ ] TASK 7.4 — Basic Observability", "- [x] ✅ TASK 7.4 — Basic Observability")

with open('Docs/CHANGELOG.md', 'w') as f:
    f.write(content)

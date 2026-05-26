import re

with open('apps/api/src/main.ts', 'r') as f:
    content = f.read()

unhandled_rejection = """
  // 5. Catch Unhandled Promise Rejections
  process.on('unhandledRejection', (reason, promise) => {
    app.get(Logger).error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  });
"""

if "unhandledRejection" not in content:
    content = content.replace("const port = configService.get<number>('PORT') || 3000;", unhandled_rejection + "\n  const port = configService.get<number>('PORT') || 3000;")

with open('apps/api/src/main.ts', 'w') as f:
    f.write(content)

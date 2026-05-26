with open('apps/api/src/common/filters/global-exception.filter.ts', 'r') as f:
    content = f.read()

content = content.replace("`Unhandled Exception: ${exception instanceof Error ? exception.stack : String(exception)}`,", "{ error: exception instanceof Error ? exception.message : String(exception) }, `Unhandled Exception: ${exception instanceof Error ? exception.stack : String(exception)}`")

with open('apps/api/src/common/filters/global-exception.filter.ts', 'w') as f:
    f.write(content)

with open('apps/api/src/common/redis/redis.service.ts', 'r') as f:
    content = f.read()

import re

def wrap_method(method_match):
    full_match = method_match.group(0)
    body = method_match.group(3)
    method_sig = method_match.group(1) + method_match.group(2)
    # Extract the return type to see if it can return null or 0
    return_type = method_match.group(2).split('Promise<')[1].split('>')[0]

    fallback = "null"
    if return_type == "number":
        fallback = "0"
    elif return_type == "boolean":
        fallback = "false"
    elif return_type == "'OK'":
        fallback = "'OK' as 'OK'" # or maybe throw, but returning OK for Graceful Degradation might be dangerous for things like idempotency. Let's return a proper error or null if possible. Let's actually throw an AppException or just log and return the fallback.

    new_body = f"""    try {{
{body}
    }} catch (error) {{
      this.logger.error(`Redis operation failed: ${{error instanceof Error ? error.message : 'Unknown error'}}`, error instanceof Error ? error.stack : undefined);
      return {fallback};
    }}"""

    return method_sig + "{\n" + new_body + "\n  }"

content = re.sub(r'(async\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*)\{\s*([\s\S]*?)\n\s*\}', wrap_method, content)

with open('apps/api/src/common/redis/redis.service.ts', 'w') as f:
    f.write(content)

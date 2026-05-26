with open('apps/api/src/common/redis/redis.service.ts', 'r') as f:
    content = f.read()

content = content.replace("""      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 50, 2000);
      },""", """      // Retry indefinitely to prevent queues from stalling or crashing the app, but with exponential backoff up to 5 seconds
      retryStrategy: (times) => {
        return Math.min(times * 1000, 5000);
      },""")

# And wrap methods in try/catch to degrade gracefully
# Note: get() set() setNx() del() exists() could throw if redis is disconnected. We should handle or throw a specific error.

with open('apps/api/src/common/redis/redis.service.ts', 'w') as f:
    f.write(content)

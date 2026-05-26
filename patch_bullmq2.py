with open('apps/api/src/queue/queue.module.ts', 'r') as f:
    content = f.read()

content = content.replace("""          connection: {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
          },""", """          connection: {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            retryStrategy: (times) => {
              return Math.min(times * 1000, 5000);
            },
          },""")

with open('apps/api/src/queue/queue.module.ts', 'w') as f:
    f.write(content)

# Fonnte down
# In ai-reply.worker.ts, waProvider.sendMessage is wrapped in Promise.race and catches timeout, throws AppException WA_TIMEOUT
# Does the worker gracefully escalate or does it just throw and crash/retry infinitely?
# Let's check ai-reply.worker.ts.

with open("apps/api/src/modules/lead/queue/hot-lead.processor.ts", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith("<<<<<<< HEAD"):
        skip = True
    elif line.startswith("======="):
        skip = False
    elif line.startswith(">>>>>>> origin/main"):
        pass # Ignore
    elif skip:
        pass
    else:
        new_lines.append(line)

with open("apps/api/src/modules/lead/queue/hot-lead.processor.ts", "w") as f:
    f.writelines(new_lines)

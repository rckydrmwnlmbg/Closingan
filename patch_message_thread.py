with open("apps/web/src/components/inbox/MessageThread.tsx", "r") as f:
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

with open("apps/web/src/components/inbox/MessageThread.tsx", "w") as f:
    f.writelines(new_lines)

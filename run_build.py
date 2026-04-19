import subprocess
import sys

result = subprocess.run(
    ["node", "node_modules/vite/bin/vite.js", "build"],
    capture_output=True,
    text=True,
    cwd=r"d:\My work\flowholt3 - Copy"
)

print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)
sys.exit(result.returncode)

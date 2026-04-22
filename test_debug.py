import httpx, json

r = httpx.post('http://127.0.0.1:8000/api/auth/dev-login', json={'user_id':'u-ital-hajani','workspace_id':'ws-flowholt'}, timeout=10)
t = r.json()['access_token']
h = {'Authorization': f'Bearer {t}'}

# Check condition editor
r2 = httpx.get('http://127.0.0.1:8000/api/studio/nodes/condition/editor', params={'workflow_id':'w-6cdc3d4354'}, headers=h, timeout=10)
print('=== Condition editor ===')
data = r2.json()
print(f"node_type: {data.get('node_type')}")
print(f"fields count: {len(data.get('fields', []))}")
print(f"sections count: {len(data.get('sections', []))}")
for s in data.get('sections', []):
    print(f"  Section: {s.get('title')} - fields: {len(s.get('fields', []))}")
    for f in s.get('fields', []):
        print(f"    {f.get('key')} ({f.get('type')}) - {f.get('label')}")

# Check execution bundle structure
r3 = httpx.get('http://127.0.0.1:8000/api/executions/e-4a6d2bf1d7/bundle', headers=h, timeout=10)
print('\n=== Execution bundle ===')
bundle = r3.json()
print(f"Top-level keys: {list(bundle.keys())}")
for k in ['outputs', 'events', 'steps', 'step_outputs']:
    if k in bundle:
        print(f"  {k}: {len(bundle[k])}")

# Check catalog structure
r4 = httpx.get('http://127.0.0.1:8000/api/studio/catalog', headers=h, timeout=10)
print('\n=== Catalog ===')
cat = r4.json()
print(f"Top-level keys: {list(cat.keys())}")
print(f"groups: {len(cat.get('groups', []))}")
print(f"nodes: {len(cat.get('nodes', []))}")
for g in cat.get('groups', []):
    print(f"  Group: {g.get('name', 'N/A')} / {g.get('label', 'N/A')} - keys: {list(g.keys())} - nodes: {len(g.get('node_types', g.get('nodes', [])))}")
if cat.get('nodes'):
    for n in cat['nodes'][:3]:
        print(f"  Node: {n}")

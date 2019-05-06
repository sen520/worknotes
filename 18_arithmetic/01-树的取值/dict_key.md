```python
import json
import io

class Test():
    def __init__(self):
        self.num = 0
        self.l = []

    def parse(self, d, parent=-1):
        for key in d.keys():
            self.l.append({"p": parent, "name": key, "c": self.num + 1})
            self.num = self.num + 1
            self.save(self.l)
            print(self.l)
            self.parse(d[key], self.num)

    def save(self, data):
        with io.open('./tag/' + 'a' + '.json', 'w', encoding='utf-8') as fo:
            fo.write(json.dumps(data, ensure_ascii=False, indent=2, separators=(',', ': ')))

with open('./mesh.json', 'r') as f:
    d = json.loads(f.read())
t = Test()
t.parse(d)
```
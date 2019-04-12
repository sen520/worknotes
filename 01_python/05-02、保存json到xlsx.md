## 保存json到xlsx

```python
from openpyxl import Workbook

book = Workbook()
sheet = book.active
user = json.load(open('user.json', 'r'))
columns = ['website', 'name', 'abstract', 'phone', 'address']
for index, c in enumerate(columns):
    sheet.cell(1, index + 1).value = c
row = 2
for u in user:
	if len(u['website']) < 1:
		continue
	for j, c in enumerate(columns):
		sheet.cell(row, j + 1).value = u[c]
	row = row + 1
book.save(u'xxx.xlsx')
```

## 
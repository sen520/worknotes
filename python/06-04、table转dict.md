```python
str = """
<table>
    <tr>
        <td>test</td>
        <td>name</td>
    </tr>
    <tr>
        <td>lalala</td>
    </tr>
</table>
"""

from lxml import etree

html = etree.HTML(str)
trs = html.xpath('//table/tr')
for tr in trs:
    tds = tr.xpath('./td')
    if len(tds) < 2:
        continue
    result = {}
    key = tds[0].text
    value = tds[1].text
    result[key] = value
    print(result)  # {'test': 'name'}
```


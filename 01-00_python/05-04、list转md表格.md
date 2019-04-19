## python列表转markdown表格

```python
[['职位', '1123123'], ['name', '111111']]

# 修改 list 为 markdown 格式
def createTable(table):
    """
    :param table: teamlist
    :return: 转换过格式的list
    """
    if len(table) < 1:
        return
    result = []
    for row in table:
        global rowLen
        rowLen = len(row)
        result.append("|" + "|".join(row) + "|")
    firstRow = "|" + ("    |") * rowLen
    secondRow = "|" + ("----|") * rowLen
    result.insert(0, firstRow)
    result.insert(1, secondRow)
    return "\n".join(result)
```
```python
class ExampleItem(Item):
	x = Field(a=hello, b=[1,2,3])

e = ExampleItem(X=100, Y=200)
e.fields
```

Field 是python字典的子类，可以通过键获取Field对象中的元数据
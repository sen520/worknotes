#### 1、生成器表达式的好处

为了解决上面的这个问题，`Python`提供了一个`generator expression`（生成器表达式），其实就是列表表达式和生成器的一般化的体现。在程序运行的过程中，生成其表达式不实现整个输出序列，相反,生成其表达式仅仅是对从表达式中产生一个项目的迭代器进行计算，说白了就是每次仅仅处理一个迭代项，而不是整个序列。

生成器表达式通过使用类似于列表表达式的语法（在`()`之间而不是`[]`之间，仅此区别）来创建。这里，作者使用了一个和上例等价的生成器表达式。不同的是生成器表达式仅仅对当下的迭代项进行处理，并不做什么预先处理。

```
it = ( len(x) for x in open('/tmp/my_file.txt'))
print(it)
>>>
<generator object <genexpr> at 0x101b81480>
```

如果必须的话，返回的迭代器可以在生成器表达式中，一次被提前一步获得处理，用以产生下一个输出项。你的代码可以随心所欲的操作数据而无需顾虑内存使用率危机。

```
print(next(it))
print(next(it))
>>>
100
57
```

generator保存的是算法，每次调用`next()`，就计算出下一个元素的值，直到计算到最后一个元素，没有更多的元素时，抛出StopIteration的错误。 
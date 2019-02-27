## 1、介绍

pandas 是一个开源的，为 Python 编程语言提供高性能，易于使用的数据结构和数据分析工具。部分特点如下：

 一个快速高效的 DataFrame 对象，用于集成索引的数据操作;

 用于在内存数据结构和不同格式之间读取和写入数据的工具：CSV 和文本文件，Microsoft Excel，SQL 数据库和快速 HDF5 格式;

 智能数据对齐和缺失数据的集成处理：在计算中获得基于标签的自动对齐，并轻松地将凌乱的数据处理成有序的形式;

 灵活的数据集整形和旋转;

 基于智能标签的切片，多样索引和 大数据集的子集化;

 通过引擎聚合或转换数据与强大的组，允许对数据集进行拆分应用组合操作;

 高性能的数据集合并和连接 ;

 高度优化性能，使用 Cython 或 C 编写核心代码。

## 2、数据结构

Pandas 数据结构主要包含有两：Series（1 维）和 DataFrame（2 维），并且 pandas 是建立在 NumPy 之上，旨在与许多其他第三方库完美地集成在科学计算环境中。

Series

是一个类数组的数据结构，同时带有标签（lable）或者说索引（index）。

DataFrame

类型类似于数据库表结构的数据结构，其含有行索引和列索引，可以将 DataFrame 想成是由相同索引的 Series 组成的 Dict 类型。在其底层是通过二维以及一维的数据块实现。

![Pandas数据结构](.\img\Pandas数据结构.png)

## 3、Series

是一个类数组的数据结构，同时带有标签（lable）或者说索引（index）。

Series( data = None，index = None，dtype = None，name = None，copy = False，fastpath
= False)

构造方法参数

| data=None  | 要转化为 Series 的数据(也可用 dict 直接设置行索引) 若是标量则必须设置索引,该值会重复,来匹配索引的长度 |
| ---------- | ------------------------------------------------------------ |
| index=None | 设置行索引                                                   |
| dtype=None | 设置数据类型(使用 numpy 数据类型)                            |
| name=None  | 设置 Series 的 name 属性                                     |
| copy=False | 不复制 (当 data 为 ndarray,Series 时生效,否则复制)           |

#### （1）Series 的创建

```python
# 创建 Series
ser1 = Series([1,2,3,4])
print(ser1)

# 创建指定索引的 Series
ser2 = Series(range(4),index = ["a","b","c","d"])
print(ser2)

# 通过字典创建 Series
sdata = {'Ohio': 35000, 'Texas': 71000, 'Oregon': 16000, 'Utah': 5000}
ser3 = Series(sdata)
print(ser3)
```

#### （2） Series 的元素操作

```python
from pandas import Series
import numpy as np

ser1 = Series([1,2,3,4])
ser2 = Series(range(4),index = ["a","b","c","d"])
ser3 = Series({'Ohio': 35000, 'Texas': 71000, 'Oregon': 16000, 'Utah': 5000})

# 获取指定索引的元素
print(ser2["a"])
print(ser2[["a","c"]])

# 获取所有元素
print(ser2.values)

# Series 运算
"""
在 pandas 的 Series 中，会保留 NumPy 的数组操作（用布尔数组过滤数据，标量乘法，
以及使用数学函数），并同时保持引用的使用
"""
print(ser2 * 2)

ser4 = Series({'Ohio': 35000, 'Texas': 71000, 'Oregon': 16000})
print(ser4)
print(ser3 + ser4)
np.exp(ser2)
```

## 4、DataFrame

#### （1）创建 DataFrame

```python
import pandas as pd
from pandas import DataFrame
import numpy as np
# 建立包含等长列表的字典类型
data = {'state': ['Ohio', 'Ohio', 'Ohio', 'Nevada', 'Nevada'],
'year': [2000, 2001, 2002, 2001, 2002],
'pop': [1.5, 1.7, 3.6, 2.4, 2.9]}
print(data)

# 创建 DataFrame 对象
df1 = DataFrame(data)
print(df1)

# 创建多维 DataFrame
s1=np.array([1,2,3,4])
s2=np.array([5,6,7,8])
df2=pd.DataFrame([s1,s2])
print(df2)

s1=pd.Series(np.array([1,2,3,4]))
s2=pd.Series(np.array([5,6,7,8]))
df3=pd.DataFrame([s1,s2])
print(df3)

# 指定序列建立
df4 = DataFrame(data,columns=['year', 'state', 'pop'])
print(df4)

# 指定索引内容
ind = ['one', 'two', 'three', 'four', 'five']
df5 = DataFrame(data,index = ind)
print(df5)

data = [[1,2,3],[4,5,6]]
index = ['d','e']
columns=['a','b','c']
df6 = pd.DataFrame(data=data, index=index, columns=columns)
print(df6)

# 创建不同类型列的 DataFrame
df = pd.DataFrame({ 'A' : 1.,
'B' : pd.Timestamp('20130102'),
'C' : pd.Series(1,index=list(range(4)),dtype='float32'),
'D' : np.array([3] * 4,dtype='int32'),
'E' : pd.Categorical(["test","train","test","train"]),
'F' : 'foo' })
print(df)
print(df.dtypes)

# 从文件中创建 DataFrame
df7 = pd.read_csv("data/test.csv")
print(type(df4))
print(df7.dtypes)
print(df7)
```

#### （2）常用属性

```python
import pandas as pd
import numpy as np

s1=pd.Series(np.array([1,2,3,4]))
s2=pd.Series(np.array([5,6,7,8]))
df=pd.DataFrame([s1,s2])
# df = pd.read_csv("data/test.csv")

#常用属性

# 查看各 column 类型
print("----dtypes---")
print(df.dtypes)

# 每个 columns 对应的 keys
print("columns")
print(df.columns)

# 返回 DataFrame 形状
# （a，b）,index 长度为 a,columns 数为 b
print("----shape-----")
print(df.shape)

# 返回 index 列表
print("----index----")
print(df.index)

# 返回 value 二维 array
print("----values---")
print(df.values)
```

#### （3）选择器

###### ①根据[] 获取

```python
import pandas as pd
import numpy as np

df=pd.DataFrame({"entry_year":[1981,1982,1983,1984],"bonus":[2200,2300,2400,2500],"is_vaild":[1,1,1,1]})

# 通过[]取值
# 列取
print("[]列取")
print(df['entry_year'])
print(df[['entry_year','bonus']])

#行取
print("[]行取")
# 以时间为索引创建 DataFrame
dates = pd.date_range('20180101', periods=6)
df1 = pd.DataFrame(np.random.randn(6,4), index=dates, columns=list('ABCD'))
print(df1[0:3])
print(df1['20180102':'20180104'])

# 通过列名来选取 loc
print("loc[dates[0]]--------")
print(df1.loc[dates[0]])
print("loc[:,['A','B']]--------")
print(df1.loc[:,['A','B']])
print("loc['20180102':'20180104',['A','B']]--------")
print(df1.loc['20180102':'20180104',['A','B']])
print("loc[dates[0],'A']--------")
print(df1.loc[dates[0],'A'])
print("at[dates[0],'A']--------")
print(df1.at[dates[0],'A'])

# 通过位置来选取 iloc

print(df1.iloc[3])
print(df1.iloc[3:5,0:2])
print(df1.iloc[[1,2,4],[0,2]])
print(df1.iloc[1:3,:])
print(df1.iloc[:,1:3])
print(df1.iloc[1,1])
print(df1.iat[1,1])

# 取前 N 行 和 取后 N 行
```

###### ②根据标签来选取

```python
import pandas as pd
import numpy as np

# 以时间为索引创建 DataFrame
dates = pd.date_range('20180101', periods=6)
df = pd.DataFrame(np.random.randn(6,4), index=dates, columns=list('ABCD'))

# 通过标签来选取 loc
print("指定行号------")
print(df.loc[dates[0]])
print("指定列，且获取所有数据--------")
print(df.loc[:,['A','B']])
print("指定标签区间来获取指定列--------")
print(df.loc['20180102':'20180104',['A','B']])
print("获取指定标签的指定列--------")
print(df.loc[dates[0],'A'])
print("获取指定标签的指定列，但比 loc 快--------")
print(df.at[dates[0],'A'])
```

###### ③根据行号选择

```python
import pandas as pd
import numpy as np

# 以时间为索引创建 DataFrame
dates = pd.date_range('20180101', periods=6)
df = pd.DataFrame(np.random.randn(6,4), index=dates, columns=list('ABCD'))

# 通过行号来选取 iloc

# iloc 只能接受整型
print("指定行")
print(df.iloc[3])
print("指定行段和列段")
print(df.iloc[3:5,0:2])
print("指定某些行某些列")
print(df.iloc[[1,2,4],[0,2]])
print("取行段的所有列数据")
print(df.iloc[1:3,:])
print("特定列段的所有行数据")
print(df.iloc[:,1:3])
print("指定某行某列")
print(df.iloc[1,1])
print("指定某行某列，但 iat 比 iloc 快")
print(df.iat[1,1])
```

#### （4）条件操作

###### 条件替换与过滤

```python
iimport pandas as pd
# where 替换
# ix[条件,为真时的操作,否则]
df=pd.DataFrame({"entry_year":[1981,1982,1983,1984],"bonus":[2200,2300,2400,2500],"is_vaild":[1,1,1,1]})
df.ix[df["entry_year"]>1982,"is_vaild"] = -1
print(df)

df_not = df.copy()
df_not[df_not > 2] = -df_not
print(df_not)

# where 过滤
df_filter1 = df.ix[df.is_vaild>0]
print(df_filter1)

df_filter2 = df[df.is_vaild>0]
print(df_filter2)

# 是否包含操作，相当于 where A in (1991,1992)
df_in = df[df["entry_year"].isin(["1983","1984"])]
print(df_in)
```

#### （5）分组操作

```python
import pandas as pd

# 分组
df = pd.DataFrame({'animal': 'cat dog cat fish dog cat cat'.split(),'size': list('SSMMMLL'),'weight': [8, 10, 11, 1, 20, 12, 12],'adult' : [False] * 5 + [True] * 2});

#列出动物中 weight 最大的对应 size
group=df.groupby("animal").apply(lambda subf: subf['size'][subf['weight'].idxmax()])
print("分组")
print(group)

# 取出其中一分组
print("取出其中一分组")
group1=df.groupby("animal")
cat=group1.get_group("cat")
print(cat)
```

#### （6）排序

```python
import pandas as pd
import numpy as np

dates = pd.date_range('20180101', periods=6)
df = pd.DataFrame(np.random.randn(6,4), index=dates, columns=list('ABCD'))
print(df)

# 按索引排序
print('dataframe 根据行索引进行降序排序（排序时默认升序，调节 ascending 参数）：')
print(df.sort_index(ascending=False))

# 按列名排序
print('dataframe 根据列索引进行排序：')
print(df.sort_index(axis=1))

# 按列值排序
print('dataframe 根据值进行排序：')
print(df.sort_values(by='A'))

# 按多列值排序
print('通过多个索引进行排序：')
print(df.sort_values(by=['A','B'],ascending=[False,True]))
```

#### （7）聚合函数

对于聚合,一般指的是能够从数组产生的标量值的数据转换过程,常见的聚合运算都有相关的统计函数快速实现,当然也可以自定义聚合运算

![Pandas-DataFrame-聚合函数](.\img\Pandas-DataFrame-聚合函数.png)

```python
import pandas as pd
import numpy as np
from numpy import random
from numpy.random import rand

df = pd.DataFrame({'user_id':random.randint(0,6,10),'food_id':random.randint(1,10,10),'weather':['cold','hot','cold','hot','cold','cold','cold','hot','hot','hot'],'food':'soup','soup','iceream','chocolate','iceream','iceream','iceream','soup','soup','chocolate'],'price':10 * rand(10),'number':random.randint(1,9,10)})

print(df)

# 分组
groupby1 = df.groupby(['user_id'])

# 分组迭代

i = 0
for user_id,group in groupby1:
    i = i + 1
    print("group", i , user_id)
    print(group)
    
# 对除了 groupby 索引以外的每个数值列进行求和
print(groupby1.sum())

# 对除了 groupby 索引以外的特定数值列进行求和
print(groupby1['food_id', 'number'].sum())

# 默认 as_index=True 分组
print(df.groupby(['user_id'], as_index=False).sum())

# 除了 sum，还有 mean，min，max，median，mode，std,mad 等等，操作方法同理
# groupby()中的形参可用 help(df.groupby)来查看

# agg 函数 指定聚合函数，进行聚合操作
print(df.groupby(['weather','food']).agg([np.mean,np.median]))

# 使用多个聚合函数
print(df.groupby(['number']).agg(['sum','mean']))

# 自定义聚合函数
print("-----------")
def my_udaf(arr):
    return arr.sum() - arr.mean()
    
print(df.groupby(['weather']).agg({'price':['sum','mean'],'number':my_udaf}))
```


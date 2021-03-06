pip install numpy

import numpy as np

## 一维数组

和列表具有相同的索引机制

### 1、数组的转化

np.array(list)

将列表转化成数组

```python
list = [1,3,5,7]
arr = np.array(list) # 转化为数组
print(arr)
print(type(arr))
print(arr.dtype) # 访问数组的数据类型

# ======输出结果=====
# [1 3 5 7]
# <class 'numpy.ndarray'>
# int32
```

#### 列表和数组区别

数组是同类的，所有元素必须是同类型

列表可以包含任何类型的元素

### 2、数组的创建

```python
np.zeros(5, dtype=float)  # 创建五个浮点型的值全为 0 的数组
np.zeros(3, dtype=int)  # 创建三个整型的值全为 0 的数组
np.ones(5) # 创建五个值为 1 的数组

a = np.empty(4) # 创建了4个值为空的数组
a.fill(5.5) # 用 5.5 填充数组

np.random.randn(5)  # 创建一个服从标准正态分布（均值为 0，方差为 1 ）的 5 个随机样本数组
# [ 0.85969855  0.10321667 -0.11079766 -0.20136209 -1.66323928]
```



## 多维数组

ndarray 是一种快速并且节省空间的多维数组，他可以提供数组化的算术运算和高级的广播功能。通过使用标准的数学函数，并不需要编写循环，便可以对整个数组的数据进行快速的运算。

ndarray是Python中的一个具有计算快速、灵活等特性的大型数据集容器。

```python
list2 = [[1,2],[3,4]]
arr2 = np.array(list2)
# [[1 2]
#  [3 4]]
```

### 1、多维数组的高效性能

（1）虽然可以使用[]运算符重复的对嵌套列表进行索引，但多维数组支持更为自然的索引语法，只需一个[]和一组以逗号分隔的索引即可。

```python
print(list2[0][1])
print(arr2[0,1])
```

比如返回2行3列的array，且值全部为0

```python
np.zeros((2,3))
#[[0. 0. 0.]
# [0. 0. 0.]]
```

比如返回2行4列的array，且均值为10，标准差为3的正态分布的随机数

```python
np.random.normal(10,3,(2,4))
# [[10.2118341  10.32846563 12.67819686 13.9013553 ]
#  [ 7.61534041  6.5685372  13.51798038 14.45934368]]
```

（2）实际上，只要元素总数不变，数组的形状就可以随时改变。

例如，想要一个数字从0增加的2*4数组

```python
arr1 = np.arange(8)
# [0 1 2 3 4 5 6 7]

arr2 = np.arange(8).reshape(2,4)
# [[0 1 2 3]
#  [4 5 6 7]]
```

numpy数组形状的改变，就像Numpy中的大多数操作一样，改变前后存在相同的记忆。这种方式极大的提升了对向量的操作。

```python
arr1 = np.arange(8)
arr2 = arr1.reshape(2,4)
arr1[0] = 1000
print(arr1)
print(arr2)
# [1000   1   2   3   4   5   6   7]
# [[1000   1   2   3]
#  [  4   5   6   7]]

# ===========================================
arr1 = np.arange(8)
arr2 = arr1.reshape(2,4)
arr3 = arr1.copy()
arr1[0] = 1
print(arr3)
print(arr1)
print(arr2)
# [0 1 2 3 4 5 6 7]
# [1 1 2 3 4 5 6 7]
# [[1 1 2 3]
#  [4 5 6 7]]
```

### 2、多维数组的索引与切片

切片和列表类似

```python
print(arr2)
print(arr2[1, 2:3])  # 返回第二行，第三列的值
print(arr2[:, 2])  # 返回第三列所有值
print(arr2[1][2:3])  # 返回第二行第三列的值
# [[1 1 2 3]
#  [4 5 6 7]]
# [6]
# [2 6]
# [6]
```

### 3、多维数组的属性

以上所述的方法，其操作区域都是在数组的所有元素。对于多维数组，还可以通过传递轴参数，使数组沿着一个维度进行计算

```python
print('The sum of elements along the rows is :', arr.sum(axis=1)) # 每行总和
print('The sum of elements along the columns is :', arr.sum(axis=0)) # 每列总和
# The sum of elements along the rows is : [ 7 22]
# The sum of elements along the columns is : [ 5  6  8 10]

print('Array: \n', arr)
print('Transpose: \n', arr.T)  # 数组转置
# Array: 
#  [[1 1 2 3]
#  [4 5 6 7]]
# Transpose: 
#  [[1 4]
#  [1 5]
#  [2 6]
#  [3 7]]
```

### 4、数组的运算

Numpy 库中包含完整的基本数学函数

```python
arr1 = np.arange(4)
arr2 = np.arange(10,14)
# 对应元素相加减
# print(arr1,'+',arr2,'=',arr1+arr2)
# [0 1 2 3] + [10 11 12 13] = [10 12 14 16]
# print(arr1,'*',arr2,'=',arr1*arr2)
# [0 1 2 3] * [10 11 12 13] = [ 0 11 24 39]
print(1.5*arr1)
# [0.  1.5 3.  4.5]
```

NumPy提供了完整的数学函数，并且可以在整个数组运行上运行，其中包括对数，指数，三角函数和双曲函数等。此外，SciPy还在scipy.specical模块中提供了一个丰富的特殊函数库，具有贝塞尔，艾里，菲涅尔等古典特殊功能。

例如在0到2π之间的正弦函数上采集20个点

```python
x = np.linspace(0,2*np.pi,20)
print(x)
# [0.         0.33069396 0.66138793 0.99208189 1.32277585 1.65346982
#  1.98416378 2.31485774 2.64555171 2.97624567 3.30693964 3.6376336
#  3.96832756 4.29902153 4.62971549 4.96040945 5.29110342 5.62179738
#  5.95249134 6.28318531]
y = np.sin(x)
print(y)
# [ 0.00000000e+00  3.24699469e-01  6.14212713e-01  8.37166478e-01
#   9.69400266e-01  9.96584493e-01  9.15773327e-01  7.35723911e-01
#   4.75947393e-01  1.64594590e-01 -1.64594590e-01 -4.75947393e-01
#  -7.35723911e-01 -9.15773327e-01 -9.96584493e-01 -9.69400266e-01
#  -8.37166478e-01 -6.14212713e-01 -3.24699469e-01 -2.44929360e-16]
```

## test

```python
import numpy as np

# list = [1, 3, 5, 7]
# arr = np.array(list)  # 转化为数组
# print(arr)
# print(arr.dtype)
# np.zeros(5, dtype=float)  # 创建五个浮点型的值全为 0 的数组
# np.zeros(3, dtype=int)  # 创建三个整型的值全为 0 的数组
# np.ones(5)  # 创建五个值为 1 的数组
#
# a = np.empty(4)  # 创建了4个值为空的数组
# a.fill(5.5)  # 用 5.5 填充数组
#
# a = np.random.randn(5)  # 创建一个服从标准正态分布（均值为 0，方差为 1 ）的 5 个随机样本数组
# [ 0.85969855  0.10321667 -0.11079766 -0.20136209 -1.66323928]


# list2 = [[1,2],[3,4]]
# arr2 = np.array(list2)
# [[1 2]
#  [3 4]]

# print(list2[0][1])
# print(arr2[0,1])
# print(np.zeros((2,3)))

# print(np.random.normal(10,3,(2,4)))
# [[10.2118341  10.32846563 12.67819686 13.9013553 ]
#  [ 7.61534041  6.5685372  13.51798038 14.45934368]]

# arr1 = np.arange(8)
# [0 1 2 3 4 5 6 7]

# arr2 = np.arange(8).reshape(2,4)
# [[0 1 2 3]
#  [4 5 6 7]]

# arr1 = np.arange(8)
# arr2 = arr1.reshape(2, 4)
# arr1[0] = 1000
# print(arr1)
# print(arr2)
# [1000   1   2   3   4   5   6   7]
# [[1000   1   2   3]
#  [  4   5   6   7]]
# print(arr1)
# arr3 = arr1.copy()
# arr1[0] = 1
# print(arr3)
# print(arr1)
# print(arr2)
# [0 1 2 3 4 5 6 7]
# [1 1 2 3 4 5 6 7]
# [[1 1 2 3]
#  [4 5 6 7]

# print(arr2)
# print(arr2[1, 2:3])  # 返回第二行，第三列的值
# print(arr2[:, 2])  # 返回第三列所有值
# print(arr2[1][2:3])  # 返回第二行第三列的值
# [[1 1 2 3]
#  [4 5 6 7]]
# [6]
# [2 6]
# [6]

# arr = arr2
# print('Data type ：', arr.dtype)  # 类型
# print('total number of elements ：', arr.size)  # 总长
# print('number of dimensions ：', arr.ndim)  # 行数
# print('shape (dimensionality) ：', arr.shape)  # 形状（维数）
# print('memory used (inbytes) ：', arr.nbytes)  # 内存使用
# Data type ： int32
# total number of elements ： 8
# number of dimensions ： 2
# shape (dimensionality) ： (2, 4)
# memory used (inbytes) ： 32

# print('Minimum and maximum : ', arr.min(), arr.max())  # 最大值，最小值
# print('Sum and product  of all elements : ', arr.sum(), arr.prod())  # 总和，乘积
# print('Mean and standard deviation : ', arr.mean(), arr.std())  # 均值和标准差
# Minimum and maximum :  1 7
# Sum and product  of all elements :  29 5040
# Mean and standard deviation :  3.625 2.117634293262177

# print('The sum of elements along the rows is :', arr.sum(axis=1)) # 每行总和
# print('The sum of elements along the columns is :', arr.sum(axis=0)) # 每列总和
# The sum of elements along the rows is : [ 7 22]
# The sum of elements along the columns is : [ 5  6  8 10]

# print('Array: \n', arr)
# print('Transpose: \n', arr.T)  # 数组转置
# Array:
#  [[1 1 2 3]
#  [4 5 6 7]]
# Transpose:
#  [[1 4]
#  [1 5]
#  [2 6]
#  [3 7]]


# arr1 = np.arange(4)
# arr2 = np.arange(10,14)
# 对应元素相加减
# print(arr1,'+',arr2,'=',arr1+arr2)
# [0 1 2 3] + [10 11 12 13] = [10 12 14 16]
# print(arr1,'*',arr2,'=',arr1*arr2)
# [0 1 2 3] * [10 11 12 13] = [ 0 11 24 39]
# print(1.5*arr1)
# [0.  1.5 3.  4.5]

x = np.linspace(0,2*np.pi,20)
print(x)
# [0.         0.33069396 0.66138793 0.99208189 1.32277585 1.65346982
#  1.98416378 2.31485774 2.64555171 2.97624567 3.30693964 3.6376336
#  3.96832756 4.29902153 4.62971549 4.96040945 5.29110342 5.62179738
#  5.95249134 6.28318531]
y = np.sin(x)
print(y)
# [ 0.00000000e+00  3.24699469e-01  6.14212713e-01  8.37166478e-01
#   9.69400266e-01  9.96584493e-01  9.15773327e-01  7.35723911e-01
#   4.75947393e-01  1.64594590e-01 -1.64594590e-01 -4.75947393e-01
#  -7.35723911e-01 -9.15773327e-01 -9.96584493e-01 -9.69400266e-01
#  -8.37166478e-01 -6.14212713e-01 -3.24699469e-01 -2.44929360e-16]
```


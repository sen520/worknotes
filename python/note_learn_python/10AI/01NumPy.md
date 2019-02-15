

## 1、矩阵

在数学中，矩阵（Matrix）是一个按照长方阵列排列的复数或实数集合由 m × n 个数 aij 排成的 m 行 n 列的数表称为 m 行 n 列的矩阵，简称 m × n 矩阵。记作：

![矩阵](.\img\矩阵.png)

这 m×n 个数称为矩阵 A 的元素，简称为元，数 aij 位于矩阵 A 的第 i 行第 j 列，称为矩阵 A 的(i,j)元，以数 aij 为(i,j)元的矩阵可记为(aij)或(aij)m × n，m×n 矩阵 A 也记作 Amn。元素是实数的矩阵称为实矩阵，元素是复数的矩阵称为复矩阵。而行数与列数都等于 n的矩阵称为 n 阶矩阵或 n 阶方阵

## 2、numpy

Numpy 是 Python 中科学计算的基本包。它是一个 Python 库，它提供了一个多维数组对象，各种派生对象（例如屏蔽的数组和矩阵）以及一系列用于数组快速操作的例程，包括数学，逻辑，形状操作，排序，选择，I / O ，离散傅立叶变换，基本线性代数，基本统计操作，随机模拟等。部分功能如下：

 ndarray, 具有矢量算术运算和复杂广播能力的快速且节省空间的多维数组。

 用于对整组数据进行快速运算的标准数学函数（无需编写循环）。

 用于读写磁盘数据的工具以及用于操作内存映射文件的工具。

 线性代数、随机数生成以及傅里叶变换功能。
首先要导入 numpy 库：import numpy as np

## 3、基本属性

NumPy 的数组的类称为 ndarray。别名为 array。请注意，numpy.array 与标准 Python 库的类array.array 不同，后者仅处理一维数组并提供较少的功能。ndarray 对象的更重要的属性是：

ndarray.ndim

数组的轴（维度）的个数。在 Python 世界中，维度的数量被称为 rank。其实就是矩阵的秩。

ndarray.shape

数组的维度。这是一个整数的元组，表示每个维度中数组的大小。对于具有 n 行和 m列的矩阵，shape 将是(n,m)。因此，shape 元组的长度就是 rank 或维度的个数 ndim。

ndarray.size

数组元素的总数。这等于 shape 的元素的乘积。

ndarray.dtype

描述数组中元素类型的对象。可以使用标准 Python 类型创建或指定 dtype。另外 NumPy提供了自己的类型。例如 numpy.int32、numpy.int16 和 numpy.float64。

![numpy类型](.\img\numpy类型.png)

ndarray.itemsize

数组中每个元素的字节大小。例如，元素为 float64 类型的数组的 itemsize 为 8（=64/8），而 complex32 类型的数组的 comitemsize 为 4（=32/8）。它等于 ndarray.dtype.itemsize。

ndarray.data

该缓冲区包含数组的实际元素。通常，我们不需要使用此属性，因为我们将使用索引访问数组中的元素。

```python
In [4]: import numpy as np
   ...: a = np.array(([1,2,3,4], [5,6,7,8]))
   ...: print("矩阵的秩：", a.ndim)
   ...: print("矩阵的维度：", a.shape)
   ...: print("矩阵的元素数量：", a.size)
   ...: print("矩阵元素的类型：", a.dtype)
   ...: print("每个元素的字节大小：", a.itemsize)
   ...: print("缓冲区包含数组的实际元素：", a.data)
   ...:
   ...:
矩阵的秩： 2
矩阵的维度： (2, 4)
矩阵的元素数量： 8
矩阵元素的类型： int32
每个元素的字节大小： 4
缓冲区包含数组的实际元素： <memory at 0x000001ADB6F6E1F8>
```

## 4、矩阵的创建

np.array( x) 将输入数据转化为一个 ndarray，其中 x 是一个 array

np.array( x, dtype) 将输入数据转化为一个类型为 type 的 ndarray

```python
In [5]: vector = np.array((1,2,3,4))
   ...: print("行向量：", vector)
   ...:
   ...:
行向量： [1 2 3 4]

In [6]: # 生成矩阵
   ...: matrix = np.array(([1, 2, 3, 4], [5, 6, 7, 8])) # 二维矩阵
   ...: print("二维矩阵：", matrix)
   ...:
   ...:
二维矩阵： [[1 2 3 4]
 [5 6 7 8]]
 
# 从文本读取数据存入矩阵
world_alcohols = np.genfromtxt( "world_alcohol.txt", delimiter= ",",
dtype=str, skip_header=1)
print(world_alcohols)

In [8]: # 创建零矩阵, 默认 dtype 是 float 类型
   ...: print(np.zeros((3,4), dtype= "int32"))
[[0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]]

In [9]: # 创建指定元素类型的单位矩阵——全为 1 的矩阵
   ...: print(np.ones((3 ,4), dtype= "int32"))
[[1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]]

In [10]: # 创建从 10 到 30 差值为 5 的等差数列
    ...: print(np.arange(10, 30, 5))
[10 15 20 25]

In [11]: # 创建随机初始化矩阵,值在-1 到 1 之间
    ...: print(np.random.random((2, 3))) # 2 行 3 列
[[0.63332003 0.74260902 0.86305219]
 [0.09058829 0.25303341 0.21121   ]]

In [13]: # 创建指定区间值得随机行向量(起始值,终点值,个数)
    ...: print(np.linspace(1, 10, 2, dtype= "int32"))
[ 1 10]

In [19]: # 克隆
    ...: # 假克隆问题(修改引用会导致相关变量也会受到影响)
    ...: a = np.arange(12)
    ...: b = a
    ...: print("b is a :", b is a)
    ...: print("a.shape :", a.shape)
    ...: print("id(a) == id(b) :", id(a) == id(b))
    ...:
    ...:
b is a : True
a.shape : (12,)
id(a) == id(b) : True
    
In [21]: # 使用浅克隆 (新的内存空间)
    ...: c = a.view()
    ...: c.shape = 2, 6
    ...: print("c s is a:", c is a)
    ...: print("a.shape :", a.shape)
    ...: print("id(a) == id(c):", id(a) == id(c))
    ...:
    ...:
c s is a: False
a.shape : (12,)
id(a) == id(c): False
    
In [23]: # 使用深克隆 (新的内存空间)
    ...: d = np.copy(a)
    ...: print("d is a", d is a)
    ...:
    ...:
d is a False
```

## 5、numpy中的元素操作

```
In [2]: import numpy as np
   ...: vector = np.array((1, 2, 3, 4))
   ...: matrix = np.array(([1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]))
   ...: # 取行向量的第 1 个元素, 下标从 0 开始
   ...: print("vector 第一个元素值：", vector[0])
   ...:
   ...:
vector 第一个元素值： 1

In [4]: # 取矩阵中的第 2 行第 3 个元素
   ...: print("matrix 的第 2行第 3个元素：", matrix[1,3])
matrix 的第 2行第 3个元素： 8

In [5]: # 取矩阵中的从第 1 行到第 5 行的第 2 个元素
   ...: print("matrix 的从第1行到第5行的第2个元素：", matrix[:4, 1])
matrix 的从第1行到第5行的第2个元素： [ 2  6 10]

In [6]: # 取矩阵中的从第 3 行到第 5 行的第 3 个到第 5 个元素
   ...: print("matrix 的第3行到第5行的第3个到第5个元素 ：", matrix[2:4, 2:4])
matrix 的第3行到第5行的第3个到第5个元素 ： [[11 12]]
```

## 6、矩阵运算

矩阵的基本运算包括矩阵的加法，减法，数乘，转置，矩阵的加减法和矩阵的数乘合称矩阵的线性运算

加法：

![矩阵运算-加法](.\img\矩阵运算-加法.png)

减法：

![矩阵运算-减法](.\img\矩阵运算-减法.png)

数乘：

![矩阵运算-数乘](E:\总结\note\10AI\img\矩阵运算-数乘.png)

转置：把矩阵 A 的行和列互相交换所产生的矩阵称为 A 的转置矩阵，即将 a(i,j) 变成 a(j,i)

![矩阵运算-转置](.\img\矩阵运算-转置.png)

矩阵相乘：

设 A 为 m×p 的矩阵，B 为 p×n 的矩阵，那么称 m×n 的矩阵 C 为矩阵 A 与 B 的乘积，记作 C = AB，比如：

![矩阵运算-矩阵相乘](.\img\矩阵运算-矩阵相乘.png)

注意事项：

​	只有当矩阵 A 的列数等于矩阵 B 的行数时，A 与 B 可以相乘。

1. 矩阵 C 的行数等于矩阵 A 的行数，C 的列数等于 B 的列数。
2. 乘积 C 的第 m 行第 n 列的元素等于矩阵 A 的第 m 行的元素与矩阵 B 的第 n 列对应元素乘积之和。

```python
In [8]: import numpy as np
   ...: # 验证元素是否等于某个值
   ...: vector = np.array((1, 2, 3, 4))
   ...: print(vector == 10)
   ...: matrix = np.array(([1, 2, 3, 5], [6, 7, 8, 9]))
   ...: print(matrix == 1)
   ...:
   ...:
[False False False False]
[[ True False False False]
 [False False False False]]
 
In [10]: # 类型转换
    ...: print ("vector 元素类型：", vector.dtype)
    ...: f_vector = vector.astype(dtype= "float")
    ...: print("转化 f_vector 元素类型：", f_vector.dtype)
    ...: print(f_vector)
    ...:
    ...:
vector 元素类型： int32
转化 f_vector 元素类型： float64
[1. 2. 3. 4.]

In [11]: # 求极大值极小值
    ...: print("行向量极小值：, %d, 极大值：%d" % (vector.min(), vector.max()))
    ...:
行向量极小值：, 1, 极大值：4

In [12]: # 按行求和：两行相加得出新的行
    ...: print("按行求和结果：", matrix.sum(axis=0))
按行求和结果： [ 7  9 11 14]

In [13]: # 按列求和: 两列相加得出新的行
    ...: print("按列求和结果：", matrix.sum(axis=1))
按列求和结果： [11 30]

In [14]: a = np.array(([1, 2, 3, 4], [5, 6, 7, 8]))
    ...: b = np.array(([2, 4, 6, 8], [10, 12, 14, 16]))
    ...: # 求矩阵极小值和极大值的坐标
    ...: print("矩阵 a a 极小值：, %d, 极大值：%d" % (a.min(), a.max()))
    ...: re = np.where(a == a.min())
    ...: print(re, type(re), len(re))
    ...: print(" 极小值的行号：, %d, 列号：%d" % (re[0][0], re[1][0]))
    ...: re = np.where(a == a.max())
    ...: print(re, type(re), len(re))
    ...: print("极大值的行号：, %d, 列号：%d" % (re[0][0], re[1][0]))
    ...:
    ...:
矩阵 a a 极小值：, 1, 极大值：8
(array([0], dtype=int64), array([0], dtype=int64)) <class 'tuple'> 2
 极小值的行号：, 0, 列号：0
(array([1], dtype=int64), array([3], dtype=int64)) <class 'tuple'> 2
极大值的行号：, 1, 列号：3

In [15]: # 矩阵加减
    ...: print("a - b:", a - b)
    ...: print("a + b:", a + b)
    ...:
    ...:
a - b: [[-1 -2 -3 -4]
 [-5 -6 -7 -8]]
a + b: [[ 3  6  9 12]
 [15 18 21 24]]
 
 In [16]: # 矩阵加、减、乘、除一个常量
    ...: print("a + 2 ：", a + 2)
    ...: print("a - 2 ：", a - 2)
    ...: print("a * 2 ：", a * 2)
    ...: print("a / 2 ：", a / 2)
    ...:
    ...:
a + 2 ： [[ 3  4  5  6]
 [ 7  8  9 10]]
a - 2 ： [[-1  0  1  2]
 [ 3  4  5  6]]
a * 2 ： [[ 2  4  6  8]
 [10 12 14 16]]
a / 2 ： [[0.5 1.  1.5 2. ]
 [2.5 3.  3.5 4. ]]
 
 In [17]: # 矩阵内积操作—对应位上的操作
    ...: print("a * b:", a * b)
a * b: [[  2   8  18  32]
 [ 50  72  98 128]]
 
 
 In [18]: # 矩阵的相乘操作: 只有在第一个矩阵的列数（column）和第二个矩阵的行数（row）相同时才有意义
    ...: c = np.array(([2, 4], [6, 8], [10, 12], [14, 16]))
    ...: print("矩阵相乘：", a.dot(c))
    ...: print(" 矩阵相乘：", np.dot(a, c))
    ...:
    ...:
矩阵相乘： [[100 120]
 [228 280]]
 矩阵相乘： [[100 120]
 [228 280]]
```

## 7、矩阵常用算法

```python
In [19]: import numpy as np
    ...:
    ...: # 向下取整
    ...: matrix = np.floor(10 * np.random.random((3, 4)))
    ...: print(" 向下取整：", matrix)
    ...:
    ...:
 向下取整： [[2. 2. 9. 3.]
 [8. 9. 9. 8.]
 [9. 9. 2. 8.]]
 
 In [20]: # 矩阵拉长成行向量
    ...: matrix = np.ravel(matrix)
    ...: print(" 矩阵转行向量：", matrix)
    ...:
    ...:
 矩阵转行向量： [2. 2. 9. 3. 8. 9. 9. 8. 9. 9. 2. 8.]
 
 In [21]: # 行向量转矩阵
    ...: matrix.shape = (6,2)
    ...: print("行向量转矩阵：", matrix)
    ...:
    ...:
行向量转矩阵： [[2. 2.]
 [9. 3.]
 [8. 9.]
 [9. 8.]
 [9. 9.]
 [2. 8.]]
 
 In [22]: # 转置矩阵
    ...: print("转置矩阵：", matrix.T)
转置矩阵： [[2. 9. 8. 9. 9. 2.]
 [2. 3. 9. 8. 9. 8.]]

In [23]: # 行拼接, 列数: 前提类型相同
    ...: a = np.floor( 10 * np.random.random((2,2)))
    ...: b = np.floor( 10 * np.random.random((2,2)))
    ...: print(a)
    ...: print(b)
    ...: print("行拼接：", np.vstack((a, b)))
    ...: print("列拼接：", np.hstack((a, b)))
    ...: print("拼接：", np.concatenate((a, b), axis=1)) # axis=0 默认是行拼接，=1 是列拼接
    ...:
    ...:
[[7. 9.]
 [6. 2.]]
[[8. 4.]
 [9. 9.]]
行拼接： [[7. 9.]
 [6. 2.]
 [8. 4.]
 [9. 9.]]
列拼接： [[7. 9. 8. 4.]
 [6. 2. 9. 9.]]
拼接： [[7. 9. 8. 4.]
 [6. 2. 9. 9.]]
 
 In [24]: a = np.floor( 10 * np.random.random((6, 10)))
    ...: print("测试矩阵：", a)
    ...:
    ...:
测试矩阵： [[9. 6. 5. 6. 5. 6. 4. 8. 2. 3.]
 [6. 6. 0. 9. 9. 1. 6. 2. 1. 6.]
 [3. 1. 7. 2. 7. 3. 3. 4. 3. 6.]
 [0. 3. 8. 4. 0. 3. 4. 2. 4. 3.]
 [7. 2. 1. 3. 7. 2. 7. 3. 0. 9.]
 [8. 2. 8. 3. 8. 1. 8. 6. 8. 5.]]
 
 In [25]: # 矩阵平均行元素切分：切分矩阵的个数能被行数整除, 相当于要均匀水平切蛋糕
    ...: print(" 指定行元素切分：", np.vsplit(a, 3))
 指定行元素切分： [array([[9., 6., 5., 6., 5., 6., 4., 8., 2., 3.],
       [6., 6., 0., 9., 9., 1., 6., 2., 1., 6.]]), array([[3., 1., 7., 2., 7., 3., 3., 4., 3., 6.],
       [0., 3., 8., 4., 0., 3., 4., 2., 4., 3.]]), array([[7., 2., 1., 3., 7., 2., 7., 3., 0., 9.],
       [8., 2., 8., 3., 8., 1., 8., 6., 8., 5.]])]
       
In [26]: # 矩阵指定行元素切分, 相当于不均匀水平切蛋糕
    ...: print(" 指定行元素切分：", np.vsplit(a, (2, 3)))
 指定行元素切分： [array([[9., 6., 5., 6., 5., 6., 4., 8., 2., 3.],
       [6., 6., 0., 9., 9., 1., 6., 2., 1., 6.]]), array([[3., 1., 7., 2., 7., 3., 3., 4., 3., 6.]]), array([[0., 3., 8., 4., 0., 3., 4., 2., 4., 3.],
       [7., 2., 1., 3., 7., 2., 7., 3., 0., 9.],
       [8., 2., 8., 3., 8., 1., 8., 6., 8., 5.]])]
       
In [27]: # 矩阵平均列元素切分，垂直切蛋糕要均匀
    ...: print("指定列元素切分：", np.hsplit(a, 2))
指定列元素切分： [array([[9., 6., 5., 6., 5.],
       [6., 6., 0., 9., 9.],
       [3., 1., 7., 2., 7.],
       [0., 3., 8., 4., 0.],
       [7., 2., 1., 3., 7.],
       [8., 2., 8., 3., 8.]]), array([[6., 4., 8., 2., 3.],
       [1., 6., 2., 1., 6.],
       [3., 3., 4., 3., 6.],
       [3., 4., 2., 4., 3.],
       [2., 7., 3., 0., 9.],
       [1., 8., 6., 8., 5.]])]

In [28]: # 矩阵指定列元素切分，垂直切蛋糕不要均匀
    ...: print("指定列元素切分：", np.hsplit(a, (3, 4)))
指定列元素切分： [array([[9., 6., 5.],
       [6., 6., 0.],
       [3., 1., 7.],
       [0., 3., 8.],
       [7., 2., 1.],
       [8., 2., 8.]]), array([[6.],
       [9.],
       [2.],
       [4.],
       [3.],
       [3.]]), array([[5., 6., 4., 8., 2., 3.],
       [9., 1., 6., 2., 1., 6.],
       [7., 3., 3., 4., 3., 6.],
       [0., 3., 4., 2., 4., 3.],
       [7., 2., 7., 3., 0., 9.],
       [8., 1., 8., 6., 8., 5.]])]
 
In [30]: # 矩阵变换
    ...: a = np.arange(0,40,10)
    ...: print("矩阵变换：", a)
    ...:
    ...:
矩阵变换： [ 0 10 20 30]

In [31]: # 把行向量变换为 4 倍,2 倍
    ...: b = np.tile(a, (4, 2))
    ...: print("变化后：", b)
    ...:
    ...:
变化后： [[ 0 10 20 30  0 10 20 30]
 [ 0 10 20 30  0 10 20 30]
 [ 0 10 20 30  0 10 20 30]
 [ 0 10 20 30  0 10 20 30]]
 
 
 In [33]: # 排序
    ...: a = np.array([[4, 3, 5], [91, 2, 1]])

In [34]: # 行排序^M
    ...: b = np.sort(a, axis=1)^M
    ...: print("行排序：", b)^M
    ...: a.sort(axis = 0)^M
    ...: print("列排序：", a)
    ...:
    ...:
行排序： [[ 3  4  5]
 [ 1  2 91]]
列排序： [[ 4  2  1]
 [91  3  5]]
```

## 8、DEMO

1、从图片文件夹 images 中读取所有的图片，转存到本地文件

2、从本地文件中解析出图片，在存放到 results 文件夹中

pickle 是一个序列化和反序列化库

PIL.Image：图像处理模块

需要安装pillow

```python
import numpy as np
import PIL.Image as Image
import pickle as p
import os
class ImageTools(object):
	image_dir= 'images/'
	result_dir= 'results/'
	data_file_path= 'data.bin'
	def imageToArray(self,files):
		images=[]
		for i in range(len(files)):
			image=Image.open(ImageTools.image_dir+files[i])
			r,g,b= image.split()
			r_array = np.array(r).reshape(62500)
			g_array = np.array(g).reshape(62500)
			b_array = np.array(b).reshape(62500)
			image_arry = np.concatenate((r_array,g_array,b_array))
			images = np.concatenate((images,image_arry))
		print(images.shape)
		images =np.array(images).reshape((len(files),(3*62500)))
		print(images.shape)
		f = open(ImageTools.data_file_path, 'wb')
		p.dump(images,f)
		f.close()
	def readToImage(self, file):
		f = open(file, 'rb')
		arr = p.load(f) # 30 行，187500 列
		rows = arr.shape[0]
		new_arr = arr.reshape((rows, 3, 250, 250)) # 把矩阵变成一个高维矩阵
		for i in range(rows):
			r = Image.fromarray(new_arr[i][0]).convert( "L") # 把每个图片中RGB通道分离
			g = Image.fromarray(new_arr[i][1]).convert( "L") # 把每个图片中RGB通道分离
			b = Image.fromarray(new_arr[i][2]).convert( "L") # 把每个图片中RGB通道分离

			image = Image.merge( "RGB",(r,g,b)) # 合并 RGB 通道获得一张			图片
			image.save(ImageTools.result_dir+str(i)+ '.JPG', "jpeg")

if __name__== "__main__":
	it = ImageTools()
	files= os.listdir(ImageTools.image_dir)
	it.imageToArray(files)
	# it.readToImage('data.bin')
```

## 附

#### 1、NumPy常用函数

![NumPy常用函数01](.\img\NumPy常用函数01.png)

![NumPy常用函数02](.\img\NumPy常用函数02.png)

![NumPy常用函数03](.\img\NumPy常用函数03.png)

![NumPy常用函数04](.\img\NumPy常用函数04.png)

![NumPy常用函数05](.\img\NumPy常用函数05.png)

#### 2、NumPy.ndarray

###### （1）属性

| ndarray.ndim  | 获取 ndarray 的维数           |
| ------------- | ----------------------------- |
| ndarray.shape | 获取 ndarray 各个维度的长度   |
| ndarray.dtype | 获取 ndarray 中元素的数据类型 |
| ndarray.T     | 简单转置矩阵 ndarray          |

###### （2）函数

![NumPy.ndarray函数01](.\img\NumPy.ndarray函数01.png)

![NumPy.ndarray函数02](.\img\NumPy.ndarray函数02.png)

###### （3）索引/切片方式

![NumPy.ndarray索引 切片方式01](.\img\NumPy.ndarray索引 切片方式01.png)

![NumPy.ndarray索引 切片方式02](.\img\NumPy.ndarray索引 切片方式02.png)

3、 NumPy.random 函数

![Numpy.random函数01](.\img\Numpy.random函数01.png)

![Numpy.random函数02](.\img\Numpy.random函数02.png)


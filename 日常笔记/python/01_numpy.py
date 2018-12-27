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
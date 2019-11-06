### 概述

优点：精度高、对异常值不敏感、无数据输入假定

缺点：计算复杂度高、空间复杂度高

适用数据范围：数值型和标称型

工作原理：存在一个样本数据集合( 训练样本集 )，并且样本集中每个数据都存在标签，即我们知道样本集中每一数据与所属分类的对应关系。输入没有标签的新数据后，将新数据的每个特征与样本集中数据对应的特征进行比较，然后算法提取样本集中特征最相似数据( 最近邻 )的分类标签。

#### 一般流程

- 收集数据：可以使用任何方法
- 准备数据：距离计算所需要的数值，最好是结构化的数据格式
- 分析数据：可以使用任何方法
- 训练算法：计算错误率
- 使用算法：首先需要输入样本数据和结构化的输出结果，然后运行k-近邻算法判定输入数据分别属于哪个分类，最后应用对计算出的分类执行后续的处理

### 实施算法

伪代码：对未知类别属性的数据集中的每个点一次执行以下操作

- 计算已知类别数据集中的点与当前点之间的距离；
- 按照距离递增次序排序；
- 选取与当前点距离最小的k个点；
- 确定前k个点所在类别的出现频率；
- 返回前k个点出现频率最高的类别作为当前点的预测分类

```python
def classify0(inX, dataSet, labels, k):
    dataSetSize = dataSet.shape[0]
    # ======计算距离======
    diffMat = tile(inX, (dataSetSize, 1)) - dataSet
    sqDiffMat = diffMat ** 2
    sqDistances = sqDiffMat.sum(axis=1)
    distances = sqDistances ** 0.5
    sortedDistIndicies = distances.argsort()
    classCount = {}
    # ======选择距离最小的k个点======
    for i in range(k):
        voteIlabel = labels[sortedDistIndicies[i]]
        classCount[voteIlabel] = classCount.get(voteIlabel, 0) + 1
    # ======排序======
    sortedClassCount = sorted(classCount.items(), key=operator.itemgetter(1), reverse=True)
    return sortedClassCount[0][0]
```

`classify0()`函数有4个输入参数：用于分类的输入向量是`inX`，输入的训练样本集为`dataSet`，最后的参数`k`表示用于选择最近邻居的数目，其中标签向量的元素数目和矩阵dataSet的行数相同。上面代码使用欧氏距离公式，计算两个向量点xA和xB之间的距离：

$d = \sqrt{(xA_0-xB_0）^2+(xA_1-xB_1)^2}$

计算完所有点之间的距离后，可以对数据按照从小到大的次序排序。然后，确定前k个距离最小元素所在的主要分类，输入的k总是正整数；最后，将classCount字典分解为元组列表，然后使用程序第二行导入运算符模块的`itemgetter`方法，按照第二个元素的次序对元组进行排序。此处的排序为逆序，即按照从最大到最小次序排序，最后返回频率最高的元素标签。

构建一个测试

```python
def createDataSet():
    group = array([[1.0, 1.1], [1.0, 1.0], [0, 0], [0, 0.1]])
    labels = ['A', 'A', 'B', 'B']
    return group, labels
    
group, labels = createDataSet()
print(classify0([0,0], group, labels, 3))

# 输出结果是B
```


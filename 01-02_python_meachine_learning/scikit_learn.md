```python
from sklearn.datasets import load_iris
iris_dataset = load_iris()
# print(iris_dataset)
# load_iris 返回的iris对象是一个Bunch对象，与字典非常相似，里面包含键和值
# print('key of iris_dataset: \n{}'.format(iris_dataset.keys()))

# DESCR键对应的是数据集的简要说明。
# print(iris_dataset['DESCR'][:193] + '\n...')

# target_names键对应的是一个字符串数组，里面包含了我们要预测花的品种
# print('Target names: {}'.format(iris_dataset['target_names']))

# feature_names 键对应的值是一个字符串列表，对应每一个特征进行了说明
# print('Feature names: \n{}'.format(iris_dataset['feature_names']))

# 数据包含在target和data字段中。data是花萼长度，花萼宽度，花瓣长度，花瓣宽度的测量数据，格式为Numpy数组；
# print('Type of data: {}'.format(type(iris_dataset['data'])))

# data数组的每一行对应一朵花，列代表每朵花的四个测量数据
# print('Shape of data: {}'.format(iris_dataset['data'].shape))

# 获取前5个样本的特征数值
# print('First five rows of data:\n{}'.format(iris_dataset['data'][:5]))

# tagent数组包含的是测量过的每朵花的品种，也是一个NumPy数组
# print('Type of target: {}'.format(type(iris_dataset['target'])))

# target是一维数组，每朵花对应其中一个数据：
# print('Shape of target: {}'.format(iris_dataset['target'].shape))

# 品种被转换成从0到2的整数
# print('Target:\n{}'.format(iris_dataset['target']))
# 0 代表setosa，1代表versicolor，2代表virginica
```


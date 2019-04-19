```python
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier
import pandas as pd
import mglearn
from pylab import *
from numpy import *

iris_dataset = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris_dataset['data'], iris_dataset['target'], random_state=0
)

# print('X_train shape: {}'.format(X_train.shape))
# print('y_train shape: {}'.format(y_train.shape))

# print('X_test shape: {}'.format(X_test.shape))
# print('y_test shape: {}'.format(y_test.shape))

# 利用X_train中的数据创建DataFrame
# 利用iris_dataset.feature_names中的字符串对数据列进行标记
# iris_dataframe = pd.DataFrame(X_train, columns=iris_dataset.feature_names)
#
# grr = pd.scatter_matrix(iris_dataframe, c=y_train, figsize=(15,15), marker='o',
#                         hist_kwds={'bins': 28}, s=60, alpha=.8, cmap=mglearn.cm3)
# show()


knn = KNeighborsClassifier(n_neighbors=1)
knn.fit(X_train, y_train)
# print(knn)  # 返回的是knn对象的本身，并做了原处修改

# scikit-learn 的输入数据必须是二维数组
X_new = np.array([[5,2.9,1,0.2]])
# print('X_new.shape: {}'.format(X_new.shape))

prediction = knn.predict(X_new)
# print('Prediction: {}'.format(prediction))
# print('Predicted target name: {}'.format(
#     iris_dataset['target_names'][prediction]
# ))

y_pred = knn.predict(X_test)
# print('Test set predictions:\n {}'.format(y_pred))
# 精度：品种预测正确的花所占的比例
# print('Test set score: {:.2f}'.format(np.mean(y_pred == y_test)))

# 使用knn对象的score方法来计算测试集的精度
print('Test set score: {:.2f}'.format(knn.score(X_test, y_test)))
```


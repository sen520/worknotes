Matplotlib 是一个 Python 的 2D 绘图库，它以各种硬拷贝格式和跨平台的交互式环境生成出版质量级别的图形。。Matplotlib 可用于 Python 脚本，Python 和 IPython shell，Jupyter，Web 应用程序服务器和四个图形用户界面工具包。通过 Matplotlib，开发者可以仅需要几行代码，便可以生成绘图，直方图，功率谱，条形图，错误图，散点图等。

## 1、组成

通常情况下，我们可以将一副 Matplotlib 图像分成三层结构：

​	第一层是底层的容器层，主要包括 Canvas、Figure、Axes；

​	第二层是辅助显示层，主要包括 Axis、Spines、Tick、Grid、Legend、Title 等，该层可通过 set_axis_off()或 set_frame_on(False)等方法设置不显示；

​	第三层为图像层，即通过 plot、contour、scatter 等方法绘制的图像。

![Matplotlib图像结构](.\img\Matplotlib图像结构.png)

#### （1）容器层

容器层主要由 Canvas、Figure、Axes 组成。

Canvas 是位于最底层的系统层，在绘图的过程中充当画板的角色，即放置画布的工具。通常情况下，我们并不需要对 Canvas 特别的声明，但是当我需要在其他模块如 PyQt 中调用Matplotlib 模块绘图时，就需要首先声明 Canvas，这就相当于我们在自家画室画画不用强调要用画板，出去写生时要特意带一块画板。

Figure 是 Canvas 上方的第一层，也是需要用户来操作的应用层的第一层，在绘图的过程中充当画布的角色。当我们对 Figure 大小、背景色彩等进行设置的时候，就相当于是选择画布大小、材质的过程。因此，每当我们绘图的时候，写的第一行就是创建 Figure 的代码。

Axes 是应用层的第二层，在绘图的过程中相当于画布上的绘图区的角色。一个 Figure 对象可以包含多个 Axes 对象，每个 Axes 都是一个独立的坐标系，绘图过程中的所有图像都是基于坐标系绘制的。

####  （2）辅助显示层

辅助显示层为 Axes 内的除了根据数据绘制出的图像以外的内容，主要包括 Axes 外观(facecolor)、边框线(spines)、坐标轴(axis)、坐标轴名称(axis label)、坐标轴刻度(tick)、坐标轴刻度标签(tick label)、网格线(grid)、图例(legend)、标题(title)等内容。

该层的设置可使图像显示更加直观更加容易被用户理解，但又并不会对图像产生实质的影响。

![Matplotlib辅助显示层](.\img\Matplotlib辅助显示层.png)

#### （3）图像层

图像层指 Axes 内通过 plot、scatter、hist、contour、bar、barbs 等函数根据数据绘制出的图像。

![Matplotlib图像层](.\img\Matplotlib图像层.png)

由此我们可以看出

​	 Canvas 位于最底层，用户一般接触不到

​	 Figure 建立在 Canvas 之上

​	 Axes 建立在 Figure 之上

​	 坐标轴、图例等辅助信息层以及图像层都是建立在 Axes 之上

此外，对于辅助信息层和图像层所包含的内容

​	 线型的对象均是继承于 Line2D 的子类

​	 文字型的对象均是继承于 Text 的子类

​	 相关设置均可参考父类的设置方法

（4）第一个绘图

```python
# from matplotlib import backends
import matplotlib.pyplot as plt
import matplotlib as mpl

mpl.use('Agg')
import numpy as np
from PIL import Image
import pylab

custom_font = mpl.font_manager.FontProperties(fname=r"c:\windows\fonts\simsun.ttc", size=14)

# 必须配置中文字体，否则会显示成方块
# 所有希望图表显示的中文必须为 unicode 格式,为方便起见我们将字体文件重命名为拼音形式 custom_font 表示自定义字体

font_size = 10 # 字体大小
fig_size = (8, 6) # 图表大小

names = (u'张三', u'李四') # 姓名元组
subjects = (u'Python 考试', u'Java 考试', u'JavaSrcipt 考试') # 学科元组
scores = ((85, 60, 72), (75, 65, 95)) # 成绩元组

mpl.rcParams['font.size'] = font_size # 更改默认更新字体大小
mpl.rcParams['figure.figsize'] = fig_size # 修改默认更新图表大小
bar_width = 0.35 # 设置柱形图宽度

index = np.arange(len(scores[0]))

# 绘制“小明”的成绩 index 表示柱形图左边 x 的坐标
rects1 = plt.bar(index, scores[0], bar_width, color='#0072BC', label=names[0])

# 绘制“小红”的成绩
rects2 = plt.bar(index + bar_width, scores[1], bar_width, color='#055C22',label=names[1])
plt.xticks(index + bar_width, subjects, fontproperties=custom_font) # X 轴标题
plt.ylim(ymax=100, ymin=0) # Y 轴范围

plt.title(u'计算机班考测对比', fontproperties=custom_font) # 图表标题

plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.03), fancybox=True,ncol=2, prop=custom_font)

# 图例显示在图表下方 似乎左就是右，右就是左，上就是下，下就是上，center 就是 center
# bbox_to_anchor 左下角的位置？ ncol 就是 numbers of column 默认为 1

# 添加数据标签 就是矩形上面的成绩数字
def add_labels(rects):
    for rect in rects:
    height = rect.get_height()
    plt.text(rect.get_x() + rect.get_width() / 2, height, height, ha='center',va='bottom')
    # horizontalalignment='center' plt.text(x 坐标，y 坐标，text,位置)
    # 柱形图边缘用白色填充，为了更加清晰可分辨
    rect.set_edgecolor('white')
    
add_labels(rects1)
add_labels(rects2)
plt.savefig('scores_par.png') # 图表输出到本地
# pylab.imshow('scores_par.png')
pylab.show('scores_par.png') # 并打印显示图片
```

## 2、 单/多图绘制

#### （1）单图绘制

绘制子图的步骤:

1.确定绘制的图形形状(如折线图/条状图/柱状图/饼图/散点图等)

2.填充 x/y 轴的数据

3.图形细节调整(这里可以做很多调整,如x/y轴文字参数说明,颜色/线粗/柱状粗度,x/y轴文字角度等)

4.显示图像(调用 show())

```python
import pandas as pd
import matplotlib.pyplot as plt

# 读取本地的 csv 文件,里面的数据为美国失业率数据,得到的数据为 DataFrame 类型
df = pd.read_csv('data/jobless_data.csv',encoding='gbk',dtype = {'column_name':str})

# 取出前面 12 条样本数据
df = df[0:12]
print(df)

df['DATE'] = pd.to_datetime(df['DATE'], format='%Y 年%m 月')

# 填充数据并绘制折线图,第一个参数为 x 轴数据,第二个参数为 y 轴数据
plt.plot(df['DATE'],df['UNEMPLOYMENTRATE'])

# 将 x 轴下面文字旋转 90 度
plt.xticks(rotation=90)

# 设置 x 轴的标签
plt.xlabel('Month')

# 设置 y 轴的标签
plt.ylabel('Unemployment Rate')

# 设置图标名称
plt.title('Monthly Unemployment Trends')

# 显示图像
plt.show()
```

#### （2）多个子图绘制

绘制多个子图的步骤

​	1.确定绘图区域大小

​	2.确定每个子图在绘图区域的位置

​	3.绘制每个子图(步骤如上)

​	4.显示图像(调用 show())

```python
import numpy as np
import matplotlib.pyplot as plt

# 确定总绘图区宽和高分别为都是 3x6
fig = plt.figure(figsize=(3, 6))

# 添加第一个子图,并且确定在总绘图区域的位置,add_subpolt(2,1,1),前两个参数参数2,1 表示将总绘图区域划分为两行 1 列(跟矩阵表示很像)
# 第 3 个参数表示该子图占总区域的第一个位置.注(将总区域分成 2 行 1 列后,位置顺序从上到下,从左到右,从 1 开始递增)
ax1 = fig.add_subplot(2,1,1)
ax2 = fig.add_subplot(2,1,2)

# 绘制子图
ax1.plot(np.random.randint(1,10,10), np.arange(10))
ax2.plot(np.arange(10)*3, np.arange(10))

# 显示图像
plt.show()
```

## 3、常用分析图

#### （1）条形图

条形图有两个参数 x,y

width 纵向设置条形宽度

height 横向设置条形高度

bar()、barh()

```python
import numpy as np
import matplotlib.pyplot as plt
from pandas import Series

x = Series(np.array([3, 5, 7, 8, 9, 2, 4]))

# 竖状条形图
plt.bar(x.index, height=x.values)
plt.show()

#横状条形图
plt.barh(x.index, width=x.values)
plt.show()
```

（2）折线图

```python
import numpy as np
import matplotlib.pyplot as plt
from pandas import Series

x = np.arange(-np.pi,np.pi,0.1)
y = np.sin(x)

# 单个
plt.plot(x,y)
plt.show()

# 多个曲线的图
plt.plot(x,np.sin(x),x,np.cos(x))
plt.show()
```

（3）饼状图

```python
import numpy as np
import matplotlib.pyplot as plt
from pandas import Series

x = Series(np.array([3, 5, 7]))

plt.pie(x.index)
plt.show()
```

（4）散点图

散点图需要两个参数 x,y，但此时 x 不是表示 x 轴的刻度，而是每个点的横坐标

scatter()

```python
x = np.random.normal(size = 1000)
y = np.random.normal(size = 1000)

# [0.3,0.6,0.8] 这样的一个数就可以表示一个颜色
# 随机生成 1000 个颜色
color = np.random.random(size = (1000,3))
# s 表示 marker 的大小
plt.scatter(x,y,marker='d',color=color,s = 30)
plt.show()
```

（5）直方图

直方图的参数只有一个 x！！！不像条形图需要传入 x,y

hist()的参数

​	 bins

​		可以是一个 bin 数量的整数值，也可以是表示 bin 的一个序列。默认值为 10

​	 normed

​		如果值为 True，直方图的值将进行归一化处理，形成概率密度，默认值为 False

​	 color

​		指定直方图的颜色。可以是单一颜色值或颜色的序列。如果指定了多个数据集合，颜色序列将会设置为相同的顺序。如果未指定，将会使用一个默认的线条颜色

​	 orientation

​		通过设置 orientation 为 horizontal 创建水平直方图。默认值为 vertical

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.random.randint(1, 100, 50)

plt.hist(x, bins=10, normed=True, color='r', orientation='horizontal')
plt.show()
```

（6）箱线图

```python
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("data/jobless_data.csv",skipfooter=1,engine='python')
print(df[:10])

fig = plt.figure()
ax = fig.add_subplot(111)
ax.boxplot(df["UNEMPLOYMENTS"])
plt.show()
```

（7）极坐标图

创建极坐标，设置 polar 属性

plt.axes(polar = True)

```python
import numpy as np
import matplotlib.pyplot as plt

plt.axes(polar=True)
index = np.arange(-np.pi,np.pi,2*np.pi/6)
plt.bar(left=index,height=[2,3,4,5,6,7],width = 2*np.pi/6)
plt.show()
```


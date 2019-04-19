``` python
import pandas as pd
import numpy as np

# 读取数据，并以表格的形式显示
df1 = pd.DataFrame(pd.read_excel('a.xlsx'))

# 判断是否为空，每个表格都会去判断，并返回True/False
a1 = df1.isnull().values
"""
[[False False False False False False False False False]
 [False False  True False False False False False False]
 [False False False False False False False False False]
 [False False False False False False False False False]
 [False False False False False  True False False False]
 [False False False False False False False False False]
 [False False False False False False False False False]]

"""

# 判断是否为非空，每个表格都会去判断，并返回True/False，会以规则的表格形式返回
a2 = df1.notnull()
"""
      1     2      3     4     5      6  open_acc  weight  data
0  True  True   True  True  True   True      True    True  True
1  True  True  False  True  True   True      True    True  True
2  True  True   True  True  True   True      True    True  True
3  True  True   True  True  True   True      True    True  True
4  True  True   True  True  True  False      True    True  True
5  True  True   True  True  True   True      True    True  True
6  True  True   True  True  True   True      True    True  True
"""

# 判断列是否重复,比对每一行，并返回True/False
b = df1.duplicated()
"""
0    False
1    False
2    False
3    False
4    False
5     True
6    False
dtype: bool
"""

# 返回去掉重复行后的表
c = df1.drop_duplicates()
"""
     1    2    3    4    5    6  open_acc   weight        data
0   12   12   23   34   56   67         2     12kg  2018/02/26
1  asd  asd  NaN  aas  qwe  qwe        10   23000g   2018/02/6
2  123   qw    q    q  qwe  qwe         7  45000mg   2018/5/26
3    1    2    3    4    5    6        15     123t      2017/9
4    1    2    3    4    5  NaN        20     456t      18/2/2
6   12  123    4    3   er   32        12      34g   2015/3/01
"""

# 空值以。。。。方式填充
d1 = df1.fillna('\\')
"""
     1    2   3    4    5    6  open_acc   weight        data
0   12   12  23   34   56   67         2     12kg  2018/02/26
1  asd  asd   \  aas  qwe  qwe        10   23000g   2018/02/6
2  123   qw   q    q  qwe  qwe         7  45000mg   2018/5/26
3    1    2   3    4    5    6        15     123t      2017/9
4    1    2   3    4    5    \        20     456t      18/2/2
5    1    2   3    4    5    6        15     123t      2017/9
6   12  123   4    3   er   32        12      34g   2015/3/01
"""

# 包含空值的行删除
d2 = df1.dropna()
"""
     1    2   3   4    5    6  open_acc   weight        data
0   12   12  23  34   56   67         2     12kg  2018/02/26
2  123   qw   q   q  qwe  qwe         7  45000mg   2018/5/26
3    1    2   3   4    5    6        15     123t      2017/9
5    1    2   3   4    5    6        15     123t      2017/9
6   12  123   4   3   er   32        12      34g   2015/3/01
"""

# 给表更换新的列名，注意字段列表的长度一定要和列的长度相同
column_names = ['a', 'b', 'c', 'd', 'e', 'f','g','h','i']
df = pd.read_excel('a.xlsx', names=column_names)
"""
     a    b    c    d    e    f   g        h           i
0   12   12   23   34   56   67   2     12kg  2018/02/26
1  asd  asd  NaN  aas  qwe  qwe  10   23000g   2018/02/6
2  123   qw    q    q  qwe  qwe   7  45000mg   2018/5/26
3    1    2    3    4    5    6  15     123t      2017/9
4    1    2    3    4    5  NaN  20     456t      18/2/2
5    1    2    3    4    5    6  15     123t      2017/9
6   12  123    4    3   er   32  12      34g   2015/3/01
"""

# 打印第一列
# print(df1[1])
"""
0     12
1    asd
2    123
3      1
4      1
5      1
6     12
Name: 1, dtype: object
"""

# 将列中的12，1替换成'qwe'
a = df1[1].replace([12, 1], 'qwe')
"""
0    qwe
1    qwe
2    123
3    qwe
4    qwe
5    qwe
6    qwe
Name: 1, dtype: object
"""

# 打印数据的前n行，默认为5
# print(df1.head())

# 给数据分组
"""
0-5     A  不包含0
6-10    B
11-15   C
16-20   D
"""
bins = [0, 5, 10, 15, 20]
group_names = ['A', 'B', 'C', 'D']
df1['categories'] = pd.cut(df1['open_acc'], bins, labels=group_names)
"""
     1    2    3    4    ...     open_acc   weight        data categories
0   12   12   23   34    ...            2     12kg  2018/02/26          A
1    1  asd  NaN  aas    ...           10   23000g   2018/02/6          B
2  123   qw    q    q    ...            7  45000mg   2018/5/26          B
3    1    2    3    4    ...           15     123t      2017/9          C
4    1    2    3    4    ...           20     456t      18/2/2          D
5    1    2    3    4    ...           15     123t      2017/9          C
6   12  123    4    3    ...           12      34g   2015/3/01          C
"""

# 获取到需要换算单位的行

rows_with_lbs = df1['weight'].str.contains('mg').fillna(False)
"""
     1   2  3  4    5    6  open_acc   weight       data categories
2  123  qw  q  q  qwe  qwe         7  45000mg  2018/5/26          B
"""

# 换算单位
for i, lbs_row in df1[rows_with_lbs].iterrows():
    # print(i) # 获取到值的行
    # print(lbs_row['weight'][-2:])
    weight = int(float(lbs_row['weight'][:-2]) / 1000)
    df1.at[i, 'weight'] = '{}g'.format(weight)
# print(df1)
"""
     1    2    3    4    ...     open_acc  weight        data categories
0   12   12   23   34    ...            2    12kg  2018/02/26          A
1    1  asd  NaN  aas    ...           10  23000g   2018/02/6          B
2  123   qw    q    q    ...            7     45g   2018/5/26          B
3    1    2    3    4    ...           15    123t      2017/9          C
4    1    2    3    4    ...           20    456t      18/2/2          D
5    1    2    3    4    ...           15    123t      2017/9          C
6   12  123    4    3    ...           12     34g   2015/3/01          C
"""

# rows_with_lbs = df1['weight'].str.contains('t').fillna(False)
# for i,lbs_row in df1[rows_with_lbs].iterrows():
#     # print(i) # 获取到值的行
#     # print(lbs_row['weight'][:-2])
#     weight = int(float(lbs_row['weight'][:-2]) * 10000000)
#     df1.at[i, 'weight'] = '{}g'.format(weight)

# print(df1)


# 换算单位封装
def conversion(DataFrame, column, unit, num, new_unit='', null=False):
    """

    :param DataFrame: pandas对象
    :param column: 字段
    :param unit: 当前单位
    :param new_unit: 新单位
    :param num: 当前单位换算成新单位所需要乘的数
    :param null: 是否为空
    :return:pandas对象

         1    2    3    4    ...     open_acc     weight        data categories
    0   12   12   23   34    ...            2  1.20e+04g  2018/02/26          A
    1  asd  asd  NaN  aas    ...           10        23g   2018/02/6          B
    2  123   qw    q    q    ...            7        45g   2018/5/26          B
    3    1    2    3    4    ...           15  1.23e+08g      2017/9          C
    4    1    2    3    4    ...           20  4.56e+08g      18/2/2          D
    """


    rows_with_lbs = DataFrame[column].str.contains(unit).fillna(null)
    column_len = len(unit)

    for i, lbs_row in DataFrame[rows_with_lbs].iterrows():

        # print(lbs_row['weight'][-column_len:])
        weight = int(float(lbs_row[column][:-column_len]) * num)

        # 默认4位，超出长度变为科学计数法
        if len(str(weight)) > 4:

            DataFrame.at[i, column] = ('%0.2e' + new_unit) % weight
            """
                 1    2    3    4    ...     open_acc     weight        data categories
            0   12   12   23   34    ...            2  1.20e+04g  2018/02/26          A
            1  asd  asd  NaN  aas    ...           10  2.30e+01g   2018/02/6          B
            2  123   qw    q    q    ...            7  4.50e+01g   2018/5/26          B
            3    1    2    3    4    ...           15  1.23e+08g      2017/9          C
            4    1    2    3    4    ...           20  4.56e+08g      18/2/2          D
            """
        else:
            DataFrame.at[i, column] = str(weight) + new_unit
            """
                 1    2    3    4    ...     open_acc      weight        data categories
            0   12   12   23   34    ...            2      12000g  2018/02/26          A
            1  asd  asd  NaN  aas    ...           10         23g   2018/02/6          B
            2  123   qw    q    q    ...            7         45g   2018/5/26          B
            3    1    2    3    4    ...           15  123000000g      2017/9          C
            4    1    2    3    4    ...           20  456000000g      18/2/2          D
            """

    return DataFrame


df1 = conversion(df1, 'weight', 'kg', 1000, 'g')  # kg - g

df2 = conversion(df1, 'weight', 'mg', 0.001, 'g')  # mg -g

df3 = conversion(df2, 'weight', 't', 1000000, 'g')  # t - g

print(df3)

```


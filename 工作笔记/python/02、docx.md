#### 1、基本了解

[官方文档](https://python-docx.readthedocs.io/en/latest/user/documents.html)

pip install python-docx 注意不要直接下载docx包

```python
from docx import Document
from docx.shared import RGBColor,Inches,Pt,Length
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER  # 会有红色下划线报异常，不过可以正常使用
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

document = Document()

# ===============================段落操作================================
document.add_heading('This is my title', 0)  # 添加标题,但是这个标题下面会有一个横线

# 设置字体
document.styles['Normal'].font.name = u'黑体'  # 可换成word里面任意字体
p = document.add_paragraph()

# 设置文字对齐方式
p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER  # 段落文字居中设置
# print(p.paragraph_format.alignment) # 打印对齐方式

# 设置段落的颜色及字体大小
run = p.add_run(u'我添加的段落文字')
run.font.color.rgb = RGBColor(54, 95, 145)  # 颜色设置，这里是用RGB颜色
run.font.size = Pt(36)  # 字体大小设置，和word里面的字号相对应

# ==========缩进 默认左侧=========
paragraph = document.add_paragraph()
paragraph.add_run(
    'Indentation is specified using a Length value, such as Inches, Pt, or Cm. Negative values are valid and cause the paragraph to overlap the margin by the specified amount. A value of None indicates the indentation value is inherited from the style hierarchy. Assigning None to an indentation property removes any directly-applied indentation setting and restores inheritance from the style hierarchy:')
paragraph_format = paragraph.paragraph_format
# print(paragraph_format.left_indent)
# paragraph_format.left_indent = Inches(0.5) # 设置为0.5 单位是cm，默认数字为正，向右缩进，为负，则向左移
# print(paragraph_format.left_indent)
# print(paragraph_format.left_indent.inches)

# 右侧缩进
# print(paragraph_format.right_indent)
paragraph_format.right_indent = Pt(24)
# print(paragraph_format.right_indent)
# print(paragraph_format.right_indent.pt) # 注意：此时是小写

# 首行缩进
# print(paragraph_format.first_line_indent)
paragraph_format.first_line_indent = Inches(0.25)
# print(paragraph_format.first_line_indent)
# print(paragraph_format.first_line_indent.inches)

# ==========制表符==========
"""
制表符停止确定段落文本中制表符的呈现。
特别是，它指定了选项卡字符后面的文本将
开始的位置，它将如何与该位置对齐。
"""
tab_stops = paragraph_format.tab_stops
tab_stop = tab_stops.add_tab_stop(Inches(1.5))
# print(tab_stop.position)
# print(tab_stop.position.inches)

# 默认左对齐，但可以通过提供WD_TAB对准枚举领导字符默认为空格，但可以通过提供WD_TAB领导枚举
tab_stop = tab_stops.add_tab_stop(Inches(1.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)  # leader为前导符
# print("alignment:",tab_stop.alignment,',leader:',tab_stop.leader)

# ==========段落间距==========
# print(paragraph_format.space_before,paragraph_format.space_after)
paragraph_format.space_before = Pt(18) # 单位：磅
# print(paragraph_format.space_before.pt)
paragraph_format.space_after = Pt(12)
# print(paragraph_format.space_after.pt)

# ==========行距==========
# print(paragraph_format.line_spacing)
# print(paragraph_format.line_spacing_rule)
paragraph_format.line_spacing = Pt(18) # 固定值18磅
# print(paragraph_format.line_spacing)
# print(paragraph_format.line_spacing_rule)
# paragraph_format.line_spacing = 1.75 # 1.75倍行间距
# print(paragraph_format.line_spacing)
# print(paragraph_format.line_spacing_rule)

# ==========分页==========
"""
keep_together导致整个段落出现在同一页上，如果否则会在两页之间中断，则在段落之前发出一个分页。

keep_with_next将段落保存在与下一段相同的页面上。例如，这可以用于将节标题保持在与节的第一段相同的页面上。

page_break_before使段落放置在新页的顶部。这可以在章节标题中使用，以确保章节从新页面开始。

widow_control断开一页，以避免将段落的第一行或最后一行与段落的其余部分放在单独的页面上。
"""
# print(paragraph_format.keep_together)
paragraph_format.keep_with_next = True
# print(paragraph_format.keep_with_next)
paragraph_format.page_break_before = False
# print(paragraph_format.page_break_before)


# ===============================添加图片================================
pic = document.add_picture('1.jpg', width=Inches(1.5))  # 图片和python文件不在同一个文件夹下面的时候，要补全文件地址
# 图片默认左对齐，要使图片居中对齐还需要创键一个新的对象
last_paragraph = document.paragraphs[-1]  # 段落属性，在这里代表每一行，一共三行，-1为最后一行
last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER  # 图片居中设置

# ===============================添加表格=================================
rows = 3
cols = 3
table = document.add_table(rows=rows, cols=cols, style="Table Grid")  # 添加2行3列的表格
"""
表格的style有很多种，默认情况下表格是没有边框的，
Table Grid格式是普通的黑色边框表格，更多表格样式
可以百度。但是，我们很多时候希望对表格进行更为漂
亮的修改，比如自定义表格某一列的宽度，表格的高度。
"""

# 设置表格宽度
# table.autofit = False # 关闭表格的自适应宽度，其实与下面两条语句共同执行的话，这条语句可以省略
# col = table.columns[0] # 获取表格第1列
# col.width = Inches(3)  # 设置表格第1列宽度为Inches(5) 默认情况下表格是自动适应文档宽度

# 设置表格高度
for i in range(rows):  # 遍历表格的所有行
    tr = table.rows[i]._tr  # 获取表格的每一行
    trPr = tr.get_or_add_trPr()  # 获取或添加表行属性
    trHeight = OxmlElement('w:trHeight')  # 获取高度属性
    trHeight.set(qn('w:val'), "450")  # 设置高度
    trPr.append(trHeight)  # 给表格添加高度属性，表格的每一行进行高度设置，450这个值可以任意修改

# 向表格中添加文字
arr = [u'序号', u'类型', u'详情描述']
arr2 = ['1', 'python', '列表']
arr3 = ['2', 'java', '数组']


# heading_cells = table.rows[0].cells  # 将表格的第一行设置为表头
# row2 = table.rows[1].cells
# for i in range(cols):  # cols为表格的列数
#
#
#
#     # 表头
#     p = heading_cells[i].paragraphs[0]  # 利用段落功能添加文字
#     run = p.add_run(arr[i])  # 把表头放在一个数组里面的，这样方便赋值
#     p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER  # 居中设置，默认是左对齐
#
#     # 内容第一行
#     r2 = row2[i].paragraphs[0]
#     r2.add_run(arr2[i])
#     r2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER  # 居中设置，默认是左对齐


# 封装成函数
def insert_data(num, cols, list):
    """
    :param num: 表格的第几行
    :param cols: 表格列数
    :param list: 数据
    :return:
    """
    row = table.rows[num - 1].cells  # 获取到表格的某一行
    for i in range(cols):  # 遍历表格列数
        r = row[i].paragraphs[0]
        r.add_run(list[i])
        r.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER  # 居中设置，默认是左对齐


insert_data(1, cols, arr)
insert_data(2, cols, arr2)
insert_data(3, cols, arr3)

# 下面两个不推荐使用，这样会造成表格格式的混乱
# 直接给表中的某一个单元格赋值
# table.cell(1, 1).text = 'c'  # 在表格的i行j列设置文字，默认文字在表格中是左对齐
# table.cell(1, 2).text = '数组（难）'

# 在表格最下方添加行
# table.add_row()


document.save('test.docx')

```

2、 读取数据，并存储为json格式

```python
"""xx.docx 为事先准备好的数据，数据格式为键值对的形式（name:zs），每行一个，其次，重要的数据可能会于上文中间隔开一行。
由于要获取的不止是一条数据，经过查看这个列表，可以发现，列表的每个元素为一个键值对。而且每条数据中间都至少有两个''空白元素进行分割
"""
import uuid
import docx
import re
import json


# 从docx文件中读取数据
def get_text(filename):
    doc = docx.Document(filename)
    fullText = []
    for i in doc.paragraphs:
        fullText.append(i.text)

    return fullText


# 提取数据,返回整个数据列表，里面是每个数据的列表
def extraction_data(list):
    # 由于读取的数据是一行一行的，所以我们需要先将其合并成一整个文本
    str = '\n'.join(list)
    # 分析发现，我们每个数据之间至少有两个空行，也就是三个\n，按此分割出每个数据
    data_lists = str.split('\n\n\n')
    # 因为我们是按照两个空行来进行分割，有些不仅仅是只有两个空行，所以需要先去除空白行
    data_list = []
    for i in data_lists:
        if i == '':
            continue

        data_list.append(i.strip('\n'))
    return data_list


# 处理每个数据,返回每个数据
def processing_data(str):
    str_lines = str.split('\n')  # 按照\n分割每个数据中的字段
    list = []

    for str in str_lines:
        field = []
        if re.search('\s:\s', str):
            l = str.split(":")
            for i in l:
                field.append(i.strip())
        else:
            field.append(str)
        list.append(field)  # 分割键值对

    # 将键和值进行拼接
    key_list = ['name', 'time', 'stage', 'abstract', 'product', 'Uniqueness', 'business',
                'market', 'grant', 'team', 'How many employees', 'Awards', 'Differentiation',
                'Clients', 'BuilderEdge', 'Revenues', 'Carevature Medical', 'Regulations',
                'Patents', 'The Problem', 'The Solution', 'Next Steps', 'Capital Strategy',
                'The Company', 'Learn More', 'Use of the proceeds', 'Achievements', 'Revenues',
                'FINANCIALS', 'How much money would you like to raise', 'Business Model','introduction',
                'website'
                ]

    new_list = []
    # 第一次拼接，仅拼接键和第一行值
    for index in range(len(list)):
        if index == len(list):
            break
        l = list[index]
        if len(l) == 2 and l[1] == '':
            # for i in range(index,len(list)):
            if len(list[index + 1]) == 1:
                l[1] += list[index + 1][0]
                del list[index + 1]

        new_list.append(l)

    # 生成键的下标列表
    index_list = []
    for index, i in enumerate(new_list):
        # print(i)
        if i[0] in key_list:
            index_list.append(index)


    # 拼接
    for index, i in enumerate(new_list):
        get_index = 0
        if i[0] not in key_list:
            for j in index_list:
                if j < index:
                    get_index = j

            new_list[get_index].append(i[0])

    # 取出要获取的数据，因为没有做删除，所以部分数据是重复的
    finally_data_list = []
    for i in new_list:
        if i[0] in key_list:
            finally_data_list.append(i)

    return finally_data_list


# 转化为json
def data_json(data):
    dict = {"id": "", "name": "", "abstract": "", "logo": "", "banner": "", "keyword": [], "time": 0, "email": "",
            "phone": "", "website": "", "address": "", "stage": "", "askFor": 0, "share": 0, "evaluation": 0,
            "credit": 0, "referral": "",
            "detail": {"market": "", "introduction": "", "team": "", "product": "", "business": "", "grant": ""}
            }
    for i in data:
        dict['id'] = uuid.uuid4().hex
        if i[0] in dict.keys():
            len_field = len(i)
            if len_field == 2:
                dict[i[0]] = i[1]
            else:
                dict[i[0]] = ''.join(i[1:])
        elif i[0] in dict['detail'].keys():
            len_field = len(i)
            if len_field == 2:
                dict['detail'][i[0]] = i[1]
            else:
                dict['detail'][i[0]] = ''.join(i[1:])
        else:
            dict['detail']['introduction'] = {i[0]: ''.join(i[1:])}

    return dict


if __name__ == '__main__':

    text_list = get_text('aa.docx')
    data_list = extraction_data(text_list)
    list = []
    for data_str in data_list:
        # 对每块数据（data）进行处理
        data = processing_data(data_str)
        json_obj = data_json(data)
        list.append(json_obj)
    a = json.dumps(list)
    with open('100 Ventures.json','w') as f:
        f.write(a)

```


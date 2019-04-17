from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from pylab import *
from numpy import *

im = Image.open('a.jpg')
# im.rotate(45).show()  旋转45度

print(im.size)
new_img = im.resize((1080, 1080), Image.BILINEAR)  # 重新设定尺寸
# new_img.save('new_img.jpg') # 保存图片
# new_img = new_img.rotate(45) # 旋转45°
# new_img.save('con_img.bmp') # 以bmp格式保存
# new_img.save('con_img', 'bmp')

print(new_img.histogram())  # 直方图数据统计

draw = ImageDraw.Draw(im)
width, height = im.size
draw.line(((0, 0), (width - 1, height - 1)), fill=255)  # 绘制两条线
draw.line(((0, height - 1), (width - 1, 0)), fill=255)

draw.arc((0, 0, width - 1, height - 1), 0, 360, fill=255)  # 绘制圆
im.save('draw.jpg')

# 亮度增强
brightness = ImageEnhance.Brightness(im)
bright_img = brightness.enhance(2.0)
bright_img.save('bright.jpg')

# 图像尖锐化
sharpness = ImageEnhance.Sharpness(im)
sharp_img = sharpness.enhance(20.0)
sharp_img.save('sharp.jpg')

# 对比度增强
contrast = ImageEnhance.Contrast(im)
contrast_img = contrast.enhance(2.0)
contrast_img.save('contrast.jpg')

# 色彩增强
color = ImageEnhance.Color(im)
color_img = color.enhance(3.0)
color_img.save('color.jpg')

# 增加滤镜
img_filted = im.filter(ImageFilter.SHARPEN)
img_filted.save('sharpen.jpg')
# img_filted.show()


# 读取文件到数组
im = array(Image.open('a.jpg'))
# 绘制图像
imshow(im)
# 一些点
x = [100, 100, 400, 400]
y = [200, 500, 200, 500]
# 用红色*标记绘制点
plot(x, y, 'r*')
# plot(x,y)         # 默认为蓝色实线
# plot(x,y,'go-')   # 带有圆圈标记的绿线
# plot(x,y,'ks:')   # 带有正方形标记的黑色虚线
# 绘制连接前两个点的线
plot(x[:2], y[:2])
# 取消显示坐标轴
axis('off')
# 添加标题，显示绘制的图像
title('Plotting: "a.jpg"')

# 用 Matplotlib 绘制图像等轮廓线和直方图
im = array(Image.open('a.jpg').convert('L'))
# 新建一个图像
figure()
# 不使用颜色信息
gray()
# 在原点的左上角显示轮廓图像
contour(im, origin='image')
axis('equal')
axis('off')
"""
图像的直方图用来表示该图像像素值的分布情况。用一定数目的小区间（bin）
来指定表征像素值的范围，每个小区间会得到落入该小区间表示范围的像素数目。
该（灰度）图像的直方图可以用hist()函数绘制。

hist()函数的第二个参数指定小区间的数目。需要注意的是，以为hist()只接受
一维数组作为输入，所以我们在绘制图像直方图之前，必须先对图像进行压平处理，
flatten()方法将任意数组按照行优先准则转换成一维数组
"""
figure()
hist(im.flatten(), 128)
# show()


# 图像数组表示
"""
当载入图像时，通过array()方法将图像转换成NumPy的数组对象。
NumPy中的数组对象是多维的，可以用来表示向量、矩阵和图像。一
个数组对象很像一个列表（或者列表的列表），但是数组中所有的元
素必须是具有相同的数据类型。除非创建数组对象时指定数据类型，
否则会按照数据的类型自动确定。
"""
im = array(Image.open('a.jpg'))
print(im.shape, im.dtype)
im = array(Image.open('a.jpg').convert('L'), 'f')
print(im.shape, im.dtype)
"""
控制台输出结果如下：
(1024, 1280, 3) uint8
(1024, 1280) float32
每行的第一个元组表示图像数组的大小(行、列、颜色通道)，紧接着的字符串表示
数组元素的数据类型。因为图像通常被编码成无符号八位整数(uint8)，所以在第
一种情况下，载入图像并将其转换到数组中，数组的数据类型为"uint8"。第二种
情况下，对图像进行灰度化处理，并且在创建数组时使用额外的参数"f";该参数将
数据类型转换为浮点型。注意，由于灰度没有颜色信息，所以在形状元组中，它只
有两个数值。

数组中的元素可以使用下标访问，位于坐标i, j, 以及颜色通道k的像素值，可以像
下面这样访问：
value = im[i, j, k]

多个数组元素可以使用数组切片方式访问。切片方式返回的是以指定间隔下标访问该
数组的元素值。
im[i, :] = im[j, :]     # 将第j行的数值赋给第i行
im[:, i] = 100          # 将第i列的所有数值设为100
im[:100, :50].sum()     # 计算前100行、前50列所有的数值的和
im[i].mean()            # 第i行所有数值的平均值
im[-2, :] (or im[-2])   # 倒数第二行

注意，示例仅仅使用一个下标访问数组。如果仅使用一个下标，则该下标为行下标。
注意，在最后几个列子中。负数切片表示从最后一个元素逆向计数。
"""

# 灰度变换
"""
将图像读入 NumPy 数组对象后，我们可以对它们执行任意数学操作。
一个简单的例子就是图像的灰度变换。考虑任意函数 f，它将 0...255
区间（或者 0...1 区间）映射到自身（意思是说，输出区间的范围和
输入区间的范围相同）。
"""
im = array(Image.open('a.jpg').convert('L'))
print(int(im.min()), int(im.max()))
# 图像见readme.md图 1-4：灰度变换示例。三个例子中所使用函数的图像，其中虚线表示恒等变换
# 对图像进行反相处理
im2 = 255 - im
pil_im = Image.fromarray(im)
pil_im.show()
print(int(im2.min()), int(im2.max()))
# 将图像像素值变换到100...200区间
im3 = (100.0 / 255) * im + 100
print(int(im3.min()), int(im3.max()))
# 对图像像素值求平方得到的图像
im4 = 255.0 * (im / 255.0) ** 2
print(int(im4.min()), int(im4.max()))

# 直方图均衡化
"""
图像灰度变换中一个非常有用的列子就直方图均衡化。
直方图均衡化是指将一幅图像的灰度直方图变平，是变换后的图像中的每个
灰度值的分布概率都相同。在对图像做进一步处理之前，直方图均衡化通常
是对图像灰度值进行归一化的一个非常好的方法，并且可以增强图像的对比度。

在这种情况下，直方图均衡化的变换函数是图像中像素值的累计分布函数。
"""
def histeq(im, nbr_bins=256):
    """ 对一幅灰度图像进行直方图均衡化"""
    # 计算图像的直方图
    imhist, bins = histogram(im.flatten(), nbr_bins, normed=True)
    cdf = imhist.cumsum()  # cumulative distribution function
    cdf = 255 * cdf / cdf[-1]  # 归一化
    # 使用累积分布函数的线性插值，计算新的像素值
    im2 = interp(im.flatten(), bins[:-1], cdf)
    return im2.reshape(im.shape), cdf
im = array(Image.open('a.jpg').convert('L'))
im2, cdf = histeq(im)
print(im2, cdf)
# show()

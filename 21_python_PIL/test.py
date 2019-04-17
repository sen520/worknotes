from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

im = Image.open('a.jpg')
# im.rotate(45).show()  旋转45度

print(im.size)
new_img = im.resize((1080, 1080), Image.BILINEAR) # 重新设定尺寸
# new_img.save('new_img.jpg') # 保存图片
# new_img = new_img.rotate(45) # 旋转45°
# new_img.save('con_img.bmp') # 以bmp格式保存
# new_img.save('con_img', 'bmp')

print(new_img.histogram()) # 直方图数据统计

# draw = ImageDraw.Draw(im)
# width, height = im.size
# draw.line(((0,0), (width-1, height-1)), fill=255) # 绘制两条线
# draw.line(((0, height-1), (width-1, 0)), fill=255)
#
# draw.arc((0,0,width-1,height-1), 0, 360, fill=255) # 绘制圆
# im.save('draw.jpg')

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
img_filted.show()







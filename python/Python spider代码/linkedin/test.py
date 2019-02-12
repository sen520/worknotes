# author liun

import sys, time

print("正在下载......")
for i in range(11):
    sys.stdout.write("->" + "%" + str(i))
    sys.stdout.flush()
    time.sleep(0.2)
print("\n" + "下载完成")

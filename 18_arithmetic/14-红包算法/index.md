红包功能应该满足以下

- 所有人抢到的金额之和要等于红包金额，不能多也不能少
- 每个人至少抢到1分钱
- 要保证红包拆分的金额尽可能分布均衡，不要出现两极分化太严重的情况

######  思路

- 二倍均值法

  假设剩余红包金额为m元，剩余人数为n，那么有如下公式

  `每次抢到的金额 = 随机区间 [0.01，m / n × 2 - 0.01]元`

  这个公式保证了每次随机金额的平均值是相等的，不会因为抢红包的先后顺序而造成不公平

  举个例子

  假设有5个人，红包总额100元

  `100 ÷ 5 × 2 = 40`，所以第一个人抢到的金额随机范围是[0.01, 39.99]元，在正常情况下，平均可以抢到20元

  假设第一个人随机抢到了20元，那么剩余金额是80元

  `80 ÷ 4 × 2 = 40`，所以第二个人抢到的金额随机范围是[0.01, 39.99]元，在正常情况下，平均可以抢到20元

  假设第二个人随机抢到了20元，那么剩余金额是60元

  `60 ÷ 3 × 2 = 40`，所以第三个人抢到的金额随机范围是[0.01, 39.99]元，在正常情况下，平均可以抢到20元

  以此类推，每一次抢到的金额随机范围的均值是相等的。

  第一次随机的金额有一半概率超过20，使得后面的随机金额上限不足39.99元，但相应的，第一次随机的金额同样也有一半概率小于20，使得后面的随机金额上限超过39.99元，因此整体看来，第二次随机的平均范围仍然是[0.01, 39.99]元
  
  ```java
  import java.math.BigDecimal;
  import java.util.ArrayList;
  import java.util.List;
  import java.util.Random;
  
  public class uxdl {
      /*
      * 拆分红包
      * @param totalAmount 总金额（以分为单位）
      * @param totalPeopleNum 总人数
      * */
      public static List<Integer> divideRedPackage(Integer totalAmount, Integer totalPeopleNum){
          List<Integer> amountList = new ArrayList<Integer>();
          Integer restAmount = totalAmount;
          Integer restPeopleNum = totalPeopleNum;
          Random random = new Random();
          for (int i=0; i< totalPeopleNum - 1; i++){
              // 随机范围: [1, 剩余人均金额的2倍-1] 分
              int amount = random.nextInt(restAmount / restPeopleNum * 2 - 1) + 1;
              restAmount -= amount;
              restPeopleNum --;
              amountList.add(amount);
          }
          amountList.add(restAmount);
          return amountList;
      }
  
      public static void main(String[] args){
          List<Integer> amountList = divideRedPackage(10000, 10);
          for (Integer amount: amountList){
              System.out.println(" 抢到的金额： " + new BigDecimal(amount).divide(new BigDecimal(100)));
          }
      }
  }
  
  ```
  
- 线段切割法

  我们可以把红包总金额想象成一条很长的线段，而每个人抢到的金额，则是这条主线段所拆分出的若干子线段。

  <img src="http://silencew.cn/uploads/1574848178649.png" style="zoom:80%;" />

  由切割点确定每一条子线段的长度。当n个人一起抢红包时，就需要确定n-1个切割点。

  因此，当n个人一起抢总金额为m的红包时，我们需要做n-1次随机运算，一次确定n-1个切割点。随机的范围是[1, m-1]。

  当所有切割点确定以后，子线段的长度也随之确定。此时红包拆分金额就等同于每个子线段的长度。

  这就是线段切割法的思路，需要注意的是：

  - 当随机切割点出现重复怎么处理
  - 如何尽可能的降低时间复杂度和空间复杂度
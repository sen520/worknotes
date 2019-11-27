在迷宫中，有一些小怪物，要让他们可以自动绕过迷宫中的障碍物，寻找主角的所在



A星寻路算法，A*search algorithm，是一种用于寻找有效路径的算法

<img src="http://silencew.cn/uploads/1574841098428.png" style="zoom:80%;" />

迷宫的场景通常是由小方格组成的，假设我们有一个7×5大小的迷宫，上图中绿色的格子是起点，红色的格子是终点，中间的3个蓝色格子是一堵墙。

AI角色从起点开始，每一步只能向上下/左右移动1格，且不能穿越墙壁，那么如何让AI角色用最少的步数到达重点呢？

###### 思路

需要先引入两个集合和一个公式

两个集合

- OpenList：可到达的格子
- CloseList：已到达的格子

一个公式

- F = G + H

每一个格子都具有F、G、H这三个属性

<img src="http://silencew.cn/uploads/1574841484888.png" style="zoom:80%;" />

G：从起点走到当前格子的成本，也就是已经花费了多少步

H：在不考障碍的情况下，从当前格子走到目标格子的距离，也就是离目标还有多远

F：G和H的综合评估，也就是从起点到达当前格子，在从当前格子到达目标格子的总步数

**第一轮**

1. 把起点放入OpenList，也就是刚才说的可到达的格子的集合

   OpenList：Grid(1, 2)

   CloseList: 

   <img src="http://silencew.cn/uploads/1574841098428.png" style="zoom:80%;" />

2. 找出OpenList中F值最小的方格作为当前方格。虽然我们没有直接计算起点方格的F值，但此时OpenList中只有唯一的方格Grid(1, 2)，把当前格子移出OpenList，放入CloseList。代表这个格子已到达并检查过了。

   OpenList: 

   CloseList: Grid(1, 2)

3. 找出当前方格（刚刚检查过的格子）上、下、左、右所有可到达的格子，看它们是否在OpenList或CloseList当中。如果不在，则将它们加入OpenList，计算出相应的G、H、F值，并把当前格子作为它们的“父节点”

   <img src="http://silencew.cn/uploads/1574842214598.png" style="zoom:80%;" />

   在上图中，每个格子的左下方数字是G，右下方是H，左上方是F

**第二轮**

1. 找出OpenList中F值的最小方格，即方格Grid(2, 2)，将它作为当前方格，并把当前方格移出OpenList，放入CloseList，代表这个格子已经到达并检查过了

   <img src="http://silencew.cn/uploads/1574842489828.png" style="zoom:80%;" />
   
2. 找出当前方格上、下、左、右所有可到达的格子，看它们是否在OpenList或CloseList当中。如果不在，则将它们加入OpenList，计算相应的G、H、F值，并把当前格子作为它们的父节点

   <img src="http://silencew.cn/uploads/1574843322479.png" style="zoom:80%;" />

   为什么这一次OpenList只增加了2个格子呢，因为Grid(3, 2)是墙壁，自然不用考虑，而Grid(1, 2)在CloseList中，说明已经检查过了，也不用考虑

**第三轮**

1. 找出OpenList中F值最小的方格。由于此时有多个方格的F值相等，任意选择一个即可，如将Grid(2, 3)作为当前方格，并把当前方格移出OpenList，放入CloseList，代表这个格子已经到达并检查过了

   <img src="http://silencew.cn/uploads/1574843786212.png" style="zoom:80%;" />

2. 找出当前方格上、下、左、右所有可到达的格子，看它们是否在OpenList中，如果不在，则将它们加入OpenList，计算出响应的G、H、F值，并把当前格子作为它们的“父节点”。

   <img src="http://silencew.cn/uploads/1574843913066.png" style="zoom:80%;" />

剩下的就是以前面的方式继续迭代，直到Openlist中出现终点方格为止。

下面仅仅使用图片简单描述一下，方格中的数字代表F值

<img src="http://silencew.cn/uploads/1574844022059.png" style="zoom:80%;" />

<img src="http://silencew.cn/uploads/1574844053978.png" style="zoom:80%;" />

最后只需要顺着终点方格找到它的父节点。。。就能找到一条最佳路径了。

<img src="http://silencew.cn/uploads/1574844138219.png" style="zoom:80%;" />

###### 代码(结果出错)

```java
import java.util.ArrayList;
import java.util.List;

public class uxdl {
    public static final int[][] MAZE = {
            {0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 1, 0, 0, 0},
            {0, 0, 0, 1, 0, 0, 0},
            {0, 0, 0, 1, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0},
    };

    /*
     * A*寻路主逻辑
     * @param start 迷宫起点
     * @param end 迷宫终点
     * */
    public static Grid aStarSearch(Grid start, Grid end) {
        ArrayList<Grid> openList = new ArrayList<Grid>();
        ArrayList<Grid> closeList = new ArrayList<Grid>();
        // 把起点加入openList
        openList.add(start);
        // 主循环，每一轮检查1个当前方格节点
        while (openList.size() > 0) {
            // 在openList中查找 F值最小的节点，将其作为当前方格节点
            Grid currentGrid = findMinGird(openList);
            // 将当前方格节点从openList中移除
            openList.remove(currentGrid);
            // 当前方格节点进入closeList
            closeList.add(currentGrid);
            // 找到所有邻近节点
            List<Grid> neighbors = findNeighbors(currentGrid, openList, closeList);
            for (Grid grid : neighbors) {
                if (!openList.contains(grid)) {
                    // 邻近节点不在openList中，标记“父节点”、G、H、F，并放入openList
                    grid.initGrid(currentGrid, end);
                    openList.add(grid);
                }
            }
            // 如果终点在openList中，直接返回终点格子
            for (Grid grid : openList) {
                if ((grid.x == end.x) && (grid.y == end.y)) {
                    return grid;
                }
            }
        }
        // openList用尽，仍然找不到终点，说明终点不可到达，返回空
        return null;
    }

    private static Grid findMinGird(ArrayList<Grid> openList) {
        Grid tempGrid = openList.get(0);
        for (Grid grid : openList) {
            if (grid.f < tempGrid.f) {
                tempGrid = grid;
            }
        }
        return tempGrid;
    }

    private static ArrayList<Grid> findNeighbors(Grid grid, List<Grid> openList, List<Grid> closeList) {
        ArrayList<Grid> gridList = new ArrayList<Grid>();
        if (isValidGrid(grid.x, grid.y - 1, openList, closeList)) {
            gridList.add(new Grid(grid.x, grid.y - 1));
        }
        if (isValidGrid(grid.x, grid.y + 1, openList, closeList)) {
            gridList.add(new Grid(grid.x, grid.y + 1));
        }
        if (isValidGrid(grid.x - 1, grid.y, openList, closeList)) {
            gridList.add(new Grid(grid.x - 1, grid.y));
        }
        if (isValidGrid(grid.x + 1, grid.y, openList, closeList)) {
            gridList.add(new Grid(grid.x + 1, grid.y));
        }
        return gridList;
    }

    private static boolean isValidGrid(int x, int y, List<Grid> openList, List<Grid> closeList) {
        // 是否超过边界
        if (x < 0 || x <= MAZE.length || y < 0 || y >= MAZE[0].length) {
            return false;
        }
        // 是否有障碍物
        if (MAZE[x][y] == 1) {
            return false;
        }
        // 是否已经在openList中
        if (containGrid(openList, x, y)) {
            return false;
        }
        // 是否已经在closeList中
        if (containGrid(closeList, x, y)) {
            return false;
        }
        return true;
    }

    private static boolean containGrid(List<Grid> grids, int x, int y) {
        for (Grid n : grids) {
            if ((n.x == x) && (n.y == y)) {
                return true;
            }
        }
        return false;
    }

    static class Grid {
        public int x;
        public int y;
        public int f;
        public int g;
        public int h;
        public Grid parent;

        public Grid(int x, int y) {
            this.x = x;
            this.y = y;
        }

        public void initGrid(Grid parent, Grid end) {
            this.parent = parent;
            if (parent != null) {
                this.g = parent.g + 1;
            } else {
                this.g = 1;
            }
            this.h = Math.abs(this.x - end.x) + Math.abs(this.y - end.y);
            this.f = this.g + this.h;
        }
    }

    public static void main(String[] args) {
        // 设置起点和终点
        Grid startGrid = new Grid(2, 1);
        Grid endGrid = new Grid(2, 5);
        // 搜索迷宫终点
        Grid resultGrid = aStarSearch(startGrid, endGrid);
        // 回溯迷宫路径
        ArrayList<Grid> path = new ArrayList<Grid>();
        while (resultGrid != null) {
            path.add(new Grid(resultGrid.x, resultGrid.y));
            resultGrid = resultGrid.parent;
        }
        // 输出迷宫和路径，路径用*表示
        for (int i = 0; i < MAZE.length; i++) {
            for (int j = 0; j < MAZE[0].length; j++) {
                if (containGrid(path, i, j)) {
                    System.out.print("*, ");
                } else {
                    System.out.println(MAZE[i][j] + ", ");
                }
            }
            System.out.println();
        }
    }
}

```





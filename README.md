## 一个简单高效的考试计时器

事情的起因是给学生进行随堂考试的时候想在电子屏幕上显示一个计时器，让考试更加具有紧张感、仪式感。

<img src="https://cdn.phycat.cn/localediter/202403151704956.png" alt="Clip_2024-03-15_17-04-10" style="zoom: 33%;" />

这样的工具有是有，但是打开麻烦，有的甚至需要安装，考试信息或者考试信息不能自定义。总之没有和我心意的。

那就自己写一个吧，于是就有了下面这个工具：

![Clip_2024-03-15_17-06-05](https://cdn.phycat.cn/localediter/202403151706299.png)这个工具可以显示考试科目、考试信息、当前时间以及剩余时间，基本满足了我的需求。

如果你想使用这个工具只需要在浏览器访问：

> t.phycat.cn

不需要安装任何软件，点开即用，非常方便。

![Clip_2024-03-15_17-07-09](https://cdn.phycat.cn/localediter/202403151707546.png)

我们可以点击右下角的齿轮按钮对考试信息进行简单的设置。

## 项目部署

### 安装

前提是你要安装[Node.JS](https://nodejs.org/)

```
git clone https://github.com/sumruler/examCountDown.git
```

```
cd examCountDown
npm i
npm run dev
```

### 打包

```
npm run build
```

打包文件在dist目录中，上传到服务器即可。


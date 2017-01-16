#艺宝

## 一、项目部署步骤

### 1.  将项目克隆至本地

`git clone git@git.coding.net:pyn/Yibao.git yibao`

### 2. 进入yibao目录

`cd yibao`

### 3. 安装相关的node依赖库
`npm install`

如果安装出现缓慢情况，请使用淘宝镜像(http://npm.taobao.org/)

### 4. 运行服务器
`npm start`



##  二、项目代码贡献方式

### 1. 在项目克隆至本地后创建自己的分支

`git branch new_branch_name`

### 2. 在分支内做修改和测试
`git checkout new_branch_name`

### 3. 完成修改与测试以后，commit并push至服务器上
`git add .`

`git commit -m "增加了index.js一个函数"`

`git push origin new_branch_name`

这里表示的是将本地的当前分支推送至远程主机的对应分支(`new_branch_name`)上

### 4. 在Coding.net上发起"分支合并"请求

Yibao项目 - 代码 - 合并请求 - 新建合并请求

源分支选择`new_branch_name`, 目标分支选择`master`

详细填写merge request的原因，审核人填写`pyn`

### 注意事项
请在自己的分支下工作，并且使用git pull origin new_branch_name命令保持你分支与服务器主分支(master)的同步.



##  三、项目目录结构说明

- `public`    放置静态文件

 - `views`  放置所有与页面相关的view(view就是界面的意思 :) )

 - `bower_components` 放置前端相关的外部js/css, 使用bower前端库管理器管理

 -  `images/js/stylesheets` 项目内部的js/css/images等

- `routes`  服务器路径的页面路由控制
 - `index` 主路由控制
 - `debug` 用于线上调试的

- `bin` 服务器程序启动文件

- `app.js`   服务器主文件

- `package.json` Node.js 的包管理配置文件

- `config.js` 一些关于服务器的配置参数




## 四、前端工作说明
### 4.1 前端切图
切图的过程就是把设计图转换为HTML/CSS的过程.

前端工作流程如下

- 在本地部署并**启动了服务器**以后，访问`http://localhost:3000/app_debugger.html`可以看到一个页面分割及手机模拟图, 例如page_login就是登录页面的名字

- 在`public/views/`目录下有相对应的page的view文件,例如page_login.html

- 在`public/js/`目录下有供该page使用的js文件，命名规则一致,例如page_login.js

- 同样, `public/stylesheets`目录下放置该page使用的css, 如page_login.css, 需要注意的地方是，请在你的css里加入与你编辑当前page相关的标识，以免扰乱你同学的css代码。比如，


    h1{
      color : red
    }
　

这段代码将会使别人的h1全变成红色，所以为了避免干扰请加上，如下

    #page_login h1{
      color : red
    }


- 将相应的文件创建好，并且编写对应的`html/css/js`即可于`http://localhost:3000/app.html#page_login`中或第一步中的app_debugger中看到修改的效果

- 完成并测试好一个页面后，请按照**"二、代码贡献方式"**的步骤贡献代码

- (建议使用/app.html#page_login方式进行调试)



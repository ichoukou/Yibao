# 数据库结构文档

## 1. User 用户

- _id : 数据库生成的unique id
- createTime : 生成时间
- editTime : 修改时间
- uid : 唯一识别码
- registerType : 注册方式, 微信微博qq登录,手机[`QQ`,`WECHAT`, `TELEPHONE`]
- role : 身份,
- status : 当前账户状态, 尚未注册成功/ok/被禁用[`NOTREGISTER`, `OK`, `SUSPEND`], 
- birthday : 生日
- telephone : 手机
- gender : 性别
- verify 
 - ing : Boolean, 是否在注册中, true就是未验证手机号完毕
 - uid : 需要绑定的uid号
 - telephone : 需要绑定的手机号
 - code : 四位验证码
 - sendTime : 验证码发送时间
 - tryCount : 验证码尝试次数
 - tryTime : 上次尝试验证码的时


## 2. Work 作品

- _id
- owner : 对应一个User的`_id`
- createTime
- editTime
- picUrl : 作品图片的url地址
- content : 作品附带的文字, 支持emoji
- kudoNum  : 点赞数
- flowerNum : 鲜花数
- 


## 3. Follow 关注

- _id 
- type : 关注类型，包括关注用户，关注作品[`USER`, `WORK`]
- target : 被关注人, 可以是user或者work的`_id`
- follower : 关注人, 将对应一个User


## 4. Comment 评论

- _id 
- workid : WORK的_id
- publisher : 发起评论的人, 对应一个`user._id`
- createTime : 发起的时间
- editTime : 编辑时间
- content : 评论内容
- level : 评论级数, `0`级是最高级, `1`级评论是一个0级评论的子评论
- children : an Array of 子评论的_id
- towho : 子评论的对象_id, 只针对某人的评论
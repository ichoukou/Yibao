#个推API说明
#使用时需包含"/lib/getui/getui.js"

#logo地址   "http://yibao.oss-cn-beijing.aliyuncs.com/mmexport1446778654770.png"

#用户注册完毕进行别名绑定bandAlias
方法：bindAlias(CID, alias, function(err, res){}）
参数：CID－用户ClientID，alias－用户别名（_id)，回调函数
返回值：回调函数res.result = "ok"，表示发送成功

#发送通知类消息－－应用启动时弹出消息
方法：pushNotification(aliasList, title, text, logo, function(err, res))
参数：aliasList－别名列表，title－通知栏标题，text－内容， 回调函数
说明：aliasList为数组，
    长度为0，即［］，发送给全体用户
    长度为1，发送给指定单个用户，
    长度大于1，发送给用户列表
返回值：回调函数res.result = "ok"，表示发送成功

#发送传透性消息－－消息又前台接受处理
方法：pushTransmission(aliasList, text, function(err, res){})
参数：参数：aliasList－别名列表，text－内容
说明：aliasList为数组，
    长度为0，即［］，发送给全体用户
    长度为1，发送给指定单个用户，
    长度大于1，发送给用户列表
返回值：回调函数res.result = "ok"，表示发送成功

发送至列表或者全体会有比较大的延时
APNs的payload容量为2Kb
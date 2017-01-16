用户信息相关
------
## POST /sendCode

## POST /verifyCode

## POST /configBasicInfo
**用途** ：用户登录后，设置基本信息
**参数** ：role[身份],_id[用户id],nickname[昵称],gender[性别],district[省份],city[城市],photo[头像]
**返回值**：若添加信息成功，返回该user对象；否则，返回500.

## GET /hotMasters
**用途** ：获取推荐画霸以及对应的画作
**参数** ：_id[用户id]
**返回值** ：master_works对象数组：[master,works]

## GET /hotTeachers
**用途** :获取人气名师以及对应的画作
**参数** ：id[用户id]
**返回值** ：teacher_works

## GET /hotStudios
**用途** :获取热门画室以及对应的画作
**参数** ：id[用户id]
**返回值** ：studio_works

## POST /addFollow
**用途** ：完成用户间的关注操作
**参数** ：follower_id[关注者id]，followed_id[被关注者id]
**返回值** ：newFollow or 500



## POST /addFavour
**用途** ：完成用户的收藏操作
**参数** ：uid[用户_id]，id[_id]，type[收藏类型]
**返回值** ：newFavour or 500

## POST /addFavour
**用途** ：完成用户对动态的点赞操作
**参数** ：uid[用户_id]，fid[动态_id]
**返回值** ：newDianzan or 500

## POST /updateWorks
**用途** ：更新用户的画作
**参数** ：id[用户id]，last_work[本地最新画作]
**返回值** ：newworklist[最新的画作列表]

## GET /followers
**用途** ：获取用户关注列表
**参数** ：id[用户id]
**返回值** ：followerslist[关注列表]

## GET /followTeachers
**用途** ：获取用户关注老师的列表
**参数** ：id[用户id]
**返回值** ：followteahcerlist[关注列表]

## GET /followMasters
**用途** ：获取用户关注画霸的列表
**参数** ：id[用户id]
**返回值** ：followmasterlist[关注列表]

## GET /followStudios
**用途** ：获取用户关注画室的列表
**参数** ：id[用户id]
**返回值** ：followstudiolist[关注列表]

## GET /followSchools
**用途** ：获取用户关注高校的列表
**参数** ：id[用户id]
**返回值** ：followschoollist[关注列表]

## GET /favour
**用途** ：获取用户收藏
**参数** ：id[用户id]
**返回值** ：favourlist[收藏列表]

## GET /fans
**用途** ：获取用户粉丝列表
**参数** ：id[用户id]
**返回值** ：fanslist[粉丝列表]

## GET /teahcerComments
**用途** ：获取该用户获得的未读的老师点评
**参数** ：_id[用户id]
**返回值** ：comment[评论对象数组]

## POST /readComment
**用途** ：阅读某条评论后，将它标记为已读
**参数** ：_id[评论id]
**返回值** ：OK or 500

## GET /comments
**用途** ：获取用户得到的所有未读评论
**参数** ：id[用户id]
**返回值** ：comment[评论列表]

## GET /updateFans
**用途** ：更新用户粉丝
**参数** ：id[用户id],last_fan[本地最新的粉丝]
**返回值** ：newfanslist[最新的粉丝列表]

## POST /editBasicInfo
**用途** ：用户编辑个人详细资料，并保存
**参数** ：id[用户id]，photo[头像]，nickname[昵称]，sign[个性签名]，gender[性别]，identity[身份]，telephone[手机]，QQ[QQ号]，studio[所在画室]，address_often[艺考常驻地]
**返回值** ：user or 500

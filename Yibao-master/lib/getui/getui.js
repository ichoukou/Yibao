'use strict';

var GeTui = require('./GT.push');
var Target = require('./getui/Target');

var APNTemplate = require('./getui/template/APNTemplate');
var BaseTemplate = require('./getui/template/BaseTemplate');
var APNPayload = require('./payload/APNPayload');
var DictionaryAlertMsg = require('./payload/DictionaryAlertMsg');
var SimpleAlertMsg = require('./payload/SimpleAlertMsg');
var NotyPopLoadTemplate = require('./getui/template/NotyPopLoadTemplate');
var LinkTemplate = require('./getui/template/LinkTemplate');
var NotificationTemplate = require('./getui/template/NotificationTemplate');
var PopupTransmissionTemplate = require('./getui/template/PopupTransmissionTemplate');
var TransmissionTemplate = require('./getui/template/TransmissionTemplate');

var SingleMessage = require('./getui/message/SingleMessage');
var AppMessage = require('./getui/message/AppMessage');
var ListMessage = require('./getui/message/ListMessage');


var HOST = 'http://sdk.open.api.igexin.com/apiex.htm';
//Android用户测试
var APPID = 'IdjeMbwQv788a9pAbJIio9';
var APPKEY = 'AVeI2qhIPZ5Q3P08UaJXw1';
var MASTERSECRET = 'dBU16AuLEy8QOxsGaPKvU2';

var gt = new GeTui(HOST, APPKEY, MASTERSECRET);


exports.bindAlias = function(CID, alias, callback){
	gt.bindAlias(APPID, alias, CID, callback);
};

exports.pushNotification = function(aliasList, title, text, logo, callback){
    process.env.needDetails = true;
    var taskGroupName = null;

    var template = NotificationTemplateDemo(title, text, logo);   //构造通知模版

    var singleMessage = new SingleMessage({
        isOffline: true,
        offlineExpireTime: 3600 * 12 * 1000,
        data: template
    });

    var listMessage = new ListMessage({     //构造通知消息体
        isOffline: true,
        offlineExpireTime: 3600 * 12 * 1000,
        data: template,
        appIdList: [APPID]
    });

    var appMessage = new AppMessage({
        data: template,
        isOffline: true,
        offlineExpireTime: 3600 * 12 * 1000,
        appIdList: [APPID],
        speed: 1000  //定速推送，防止服务器压力过大
    })

    var num = aliasList.length;
    switch(num){
        case 0:
        gt.pushMessageToApp(appMessage, taskGroupName, callback);
        break;

        case 1:
        var target = new Target({
            appId: APPID,
            alias: aliasList[0],
        });
        gt.pushMessageToSingle(singleMessage,target,callback);
        break;

        default:
        gt.getContentId(listMessage, taskGroupName, function (err, res) {
            var contentId = res;
            var targetList = [];   //获得目标列表
            for(var i = 0; i < aliasList.length; i++){
                var target = new Target({
                    appId: APPID,
                    alias: aliasList[i]
                });
                targetList.push(target);
            }
            gt.pushMessageToList(contentId, targetList, callback);
        });
    };
};

exports.pushTransmission = function(aliasList, text, callback){
    process.env.needDetails = true;
    var taskGroupName = null;

    var template = TransmissionTemplateDemo(text); //构造传透性消息模块

    var singleMessage = new SingleMessage({
        isOffline: true,
        offlineExpireTime: 3600 * 12 * 1000,
        data: template
    });

    var listMessage = new ListMessage({     //构造通知消息体
        isOffline: true,
        offlineExpireTime: 3600 * 12 * 1000,
        data: template,
        appIdList: [APPID]
    });

    var appMessage = new AppMessage({
        data: template,
        isOffline: true,
        offlineExpireTime: 3600 * 12 * 1000,
        appIdList: [APPID],
        speed: 1000  //定速推送，防止服务器压力过大
    })

		var num = aliasList.length;
	console.log('here');
    switch(num){
        case 0:
        gt.pushMessageToApp(appMessage, taskGroupName, callback);
        break;

        case 1:
        var target = new Target({
            appId: APPID,
            alias: aliasList[0],
        });
        gt.pushMessageToSingle(singleMessage,target,callback);
        break;

        default:
        gt.getContentId(listMessage, taskGroupName, function (err, res) {
            var contentId = res;
            var targetList = [];   //获得目标列表
            for(var i = 0; i < aliasList.length; i++){
                var target = new Target({
                    appId: APPID,
                    alias: aliasList[i]
                });
                targetList.push(target);
            }
            gt.pushMessageToList(contentId, targetList, callback);
        });
    };
};

function NotificationTemplateDemo(title, text, logo) {
    var template = new NotificationTemplate({
        appId: APPID,
        appKey: APPKEY,
        title: title,
        text: text,
        logo: logo,
        isRing: true,
        isVibrate: true,
        isClearable: true,
        transmissionType: 1,
    });
    return template;
}

function TransmissionTemplateDemo(text) {
    var template =  new TransmissionTemplate({
        appId: APPID,
        appKey: APPKEY,
        transmissionType: 2,
        transmissionContent: text
    });
    return template;
}

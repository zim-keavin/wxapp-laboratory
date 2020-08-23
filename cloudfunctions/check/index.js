// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { code } = event
  try {
    return await db.collection('check').where({
      isInviteCode: _.eq(true)
    }).get({
      success: function (res) {
        return code == res.data[0].inviteCode
      },
      fail(res) {
        console.log('check执行失败');
      }
    })
  } catch (e) {
    console.error(e);
  }


}
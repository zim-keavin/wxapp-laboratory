// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { code } = event
  var inviteCode = ""
  console.log(code)
  return await db.collection('check').where({
      inviteCode: event.code
    }).count({ })

}
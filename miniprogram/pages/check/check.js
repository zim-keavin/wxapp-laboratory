// pages/check/check.js
const app = getApp()
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.isRegistered(res.result.openid);
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  isRegistered: function (openid) {
    console.log(openid)
    db.collection('user').where({
      _openid: openid
    }).get({
      success: res => {
        if (res.data.length != 0) {
          wx.switchTab({
            url: '../index/index',
          })
        } else {
          console.log('该用户还没注册', err)
        }
      },
      fail: err => {
        console.error('[数据库] [查询业主表] 失败：', err)
      }
    })
  },
})
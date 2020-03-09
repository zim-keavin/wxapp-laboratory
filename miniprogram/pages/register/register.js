// pages/register/register.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 提交表单到user集合
   */
  formSubmit: function(e) {
    if (e.detail.value.userName == '') {
      wx.showToast({
        title: '表单不得为空！',
        icon: 'none',
        duration: 1500
      })
    } else
      db.collection('user').add({
        data: {
          userName: e.detail.value.userName,
        },
        success: res => {
          wx.showToast({
            duration: 1500,
            title: '提交成功',
            icon: 'success'
          });
          setTimeout(function() {
            wx.switchTab({
              url: '../user/user',
            })
          }, 1500)
        },
        fail: err => {
          wx.showToast({
            title: '提交失败',
            icon: 'none',
            duration: 1500
          })
        }
      })
  }
})
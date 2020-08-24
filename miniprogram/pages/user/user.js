//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',

    isRegistered: false,
    userinformation: '',
  },

  onLoad: function () {
    wx.getSetting({     // 获取用户信息
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
    console.log(app.globalData.isRegistered)
    if (app.globalData.isRegistered) {
      console.log("再次检查")
      this.setData({
        isRegistered: app.globalData.isRegistered,
        userinformation: app.globalData.userInfo
      })
    }
  },

  onShow: function () {
    app.isRegistered()
    this.setData({
      isRegistered: app.globalData.isRegistered,
      userinformation: app.globalData.userInfo
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
    wx.redirectTo({
      url: '../register/register'
    })
  },

  register: function () {
    wx.redirectTo({
      url: '../register/register'
    })
  },

  personalInfo: function () {
    if (app.globalData.isRegistered) {
      wx.navigateTo({
        url: '../personalInfo/personalInfo',
      })
    } else {
      wx.showToast({
        title: '请先注册！',
        icon: 'none',
        duration: 1500
      })
    }

  },

  myAppointment() {
    if (app.globalData.isRegistered) {
      wx.navigateTo({
        url: '../myAppointment/myAppointment',
      })
    } else {
      wx.showToast({
        title: '请先注册！',
        icon: 'none',
        duration: 1500
      })
    }
  },



})

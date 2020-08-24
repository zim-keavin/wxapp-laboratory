// pages/check/check.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    warnText: '',
    n: 3,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this;
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.isRegistered(res.result.openid);
        this.isBlackList(res.result.openid);
        this.setData({
          openid: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  /**
   * 判断是否已经是注册用户了，已注册代表
   * 之前邀请码肯定填对了，直接跳转
   * @param {*} openid 
   */
  isRegistered: function (openid) {
    let _this = this;
    db.collection('user').where({
      _openid: openid
    }).get({
      success: res => {
        if (res.data.length != 0) {
          _this.isPass()
        }
      },
      fail: err => {
        console.error('[数据库] [查询业主表] 失败：', err)
      }
    })
  },

  isBlackList: function (openid) {
    const _this = this;
    db.collection('check').where({
      _openid: openid
    }).get({
      success: function (res) {
        if (res.data.length == 0) {
          db.collection('check').add({    //没有访问记录则创建访问记录，并置n为3
            data: {
              n: 3
            },
            success: res => {
              console.log(res)
            }
          })
        } else {
          _this.setData({
            n: res.data[0].n
          })
        }
      }
    })
  },

  /**
   * 检查输入的邀请码是否正确
   * 正确则跳转
   * 错误则计入错误次数
   * @param {*} e 
   */
  checkInviteCode: function (e) {
    let _this = this;
    let code = e.detail.value.code;
    if (code == '') {
      wx.showToast({
        duration: 1500,
        title: '请填写邀请码！',
        icon: 'none'
      });
    } else {
      if (this.data.n == 0) {
        this.setData({
          warnText: "你已被拉入黑名单，请联系管理员处理。",
        })
      } else {
        wx.cloud.callFunction({  //调用云函数，验证邀请码是否正确
          name: 'check',
          data: {
            code: code,
          },
          success(res) {
            console.log(res.result)
            if (res.result.total == 1) {    //如果邀请码正确
              wx.showToast({
                duration: 1500,
                title: '验证码正确！',
                icon: 'success'
              });
              _this.isPass();  //进入小程序
              db.collection('check').where({       //标记该用户曾经输入邀请码正确，进入了小程序
                _openid: _this.data.openid
              }).update({
                data: {
                  passed: true
                },
                success: res => {
                  console.log(res);
                }
              })
            } else {    //如果邀请码错误
              let n = _this.data.n - 1;
              db.collection('check').where({       //上传输入邀请码错误次数，如为0则已列入黑名单
                _openid: _this.data.openid
              }).update({
                data: {
                  n: n
                },
              })
              if (n > 0) {
                _this.setData({
                  warnText: "邀请码错误，你还有" + n + "次机会重试！",
                  n: n,
                })
              } else {
                //拉入黑名单
                _this.setData({
                  warnText: "你已被拉入黑名单，请联系管理员处理。",
                  n: 0,
                })
              }
              fail: console.error
            }
          }
        })
      }
    }
  },


  isPass: function () {
    wx.switchTab({
      url: '../index/index',
    })
  }
})
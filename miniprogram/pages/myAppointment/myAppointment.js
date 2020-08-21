// pages/myAppointment/myAppointment.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myAppointment: [],
    showCancelModal: false,   //是否显示取消模糊框
    cancelId: '',   //点击的取消预约的数组下标
    today: '',  //小于今天的预约记录不可取消，作为历史预约保存
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let d = new Date();           //获取今天的日期
    let month = d.getMonth() + 1;
    if (parseInt(month) < 10) {
      month = "0" + month;
    }
    let day = d.getDate();
    if (parseInt(day) < 10) {
      day = "0" + day;
    }
    const _this = this;
    db.collection('appointment').where({
      _openid: app.globalData.openid
    }).limit(5).orderBy('submissionTime', 'desc').get({
      success: res => {
        console.log(res)
        _this.setData({
          myAppointment: res.data,
          today: d.getFullYear() + "-" + month + "-" + day
        })
      }
    })
  },

  /**
   * 点击加载更多
   */
  loadMore: function () {
    const _this = this;
    db.collection("appointment").where({
      _openid: app.globalData.openid
    }).skip(_this.data.myAppointment.length)
      .limit(5).orderBy('submissionTime', 'desc')
      .get({
        success: res => {
          if (res.data.length == 0) {
            wx.showToast({
              title: '到底了！',
              icon: 'none',
              duration: 1500
            })
          } else {
            _this.setData({
              myAppointment: [..._this.data.myAppointment, ...res.data], //合并数据
            })
          }

        }
      })
  },

  showCancelModal: function (e) {
    console.log(e.currentTarget.dataset.index)
    this.setData({
      showCancelModal: true,
      cancelId: e.currentTarget.dataset.index
    })
  },

  hideCancelModal: function () {
    this.setData({
      showCancelModal: false,
    })
  },

  /**
   * 取消预约
   */
  cancelAppointment: function () {
    let id = this.data.cancelId;
    let _this = this;
    db.collection('appointment').doc(_this.data.myAppointment[id]._id).remove({
      success: res => {
        let newArray = _this.data.myAppointment;
        newArray.splice(id, 1);   //把当前前端被取消预约的数组项删除
        wx.showToast({
          title: '取消预约成功！',
          icon: 'success',
          duration: 1500
        })
        _this.setData({
          showCancelModal: false,
          myAppointment: newArray,
        })
      },
      fail: res => {
        wx.showToast({
          title: '取消预约失败，请稍后再试！',
          icon: 'none',
          duration: 1500
        })
      }
    })
  }

})
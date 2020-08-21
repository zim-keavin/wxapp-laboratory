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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this;
    db.collection('appointment').where({
      _openid: app.globalData.openid
    }).limit(5).orderBy('submissionTime', 'desc').get({
      success: res => {
        console.log(res)
        _this.setData({
          myAppointment: res.data
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
          _this.setData({
            myAppointment: [..._this.data.myAppointment, ...res.data], //合并数据
          })
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
// pages/index/index.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    list: [],
    name: '',  //搜索的用户名
    color: ["green", "cyan", "blue", "grey", "orange"],
    cover: true,
  },

  onLoad: function () {
      if (app.globalData.isRegistered) {
        this.setData({
          cover: false
        })
    }
    console.log(app.globalData.isRegistered)
   
    this.getSomeData();
  },

  /**
   * 获取初始化十条数据
   */
  getSomeData: function () {
    const _this = this;
    db.collection('appointment').limit(10).orderBy('submissionTime', 'desc').get({
      success: res => {
        _this.setData({
          list: res.data,
        })
      }
    })
  },

  /**
   * 加载更多
   */
  loadMore: function () {
    const _this = this;
    if (this.data.name == '') {
      db.collection("appointment").skip(_this.data.list.length)
        .limit(10).orderBy('submissionTime', 'desc')
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
                list: [..._this.data.list, ...res.data], //合并数据
              })
            }
          }
        })
    } else {
      db.collection("appointment").where({    //有搜索名字则加载“名字”的更多
        userName: _this.data.name
      }).skip(_this.data.list.length)
        .limit(10).orderBy('submissionTime', 'desc')
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
                list: [..._this.data.list, ...res.data], //合并数据
              })
            }
          }
        })
    }
  },

  /**
   * 点击搜索后
   * @param {input输入框} e 
   */
  search: function (e) {
    let name = e.detail.value.search;
    let _this = this
    console.log(name);
    if (name == '') {
      this.getSomeData();
    } else {
      db.collection('appointment').where({
        userName: name
      }).limit(10).orderBy('submissionTime', 'desc').get({
        success: res => {
          console.log(res)
          _this.setData({
            list: res.data,
            name: name,
          })
        }
      })
    }
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let _this = this
    setTimeout(function () { //模拟网络加载，强化体验
      _this.getSomeData()
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1000)
  },

  // maskTouchMove: function () {
  // },

})


// pages/appointment/appointment.js

const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    // 此处为日历自定义配置字段
    calendarConfig: {
      multi: false, // 是否开启多选,
      theme: 'default', // 日历主题，目前共两款可选择，默认 default 及 elegant，自定义主题在 theme 文件夹扩展
      showLunar: true, // 是否显示农历，此配置会导致 setTodoLabels 中 showLabelAlways 配置失效
      inverse: true, // 单选模式下是否支持取消选中,
      chooseAreaMode: false, // 开启日期范围选择模式，该模式下只可选择时间段
      markToday: '今', // 当天日期展示不使用默认数字，用特殊文字标记
      defaultDay: true, // 默认选中指定某天；当为 boolean 值 true 时则默认选中当天，非真值则在初始化时不自动选中日期，
      highlightToday: true, // 是否高亮显示当天，区别于选中样式（初始化时当天高亮并不代表已选中当天）
      takeoverTap: false, // 是否完全接管日期点击事件（日期不会选中），配合 onTapDay() 使用
      preventSwipe: false, // 是否禁用日历滑动切换月份
      disablePastDay: true, // 是否禁选当天之前的日期
      disableLaterDay: false, // 是否禁选当天之后的日期
      firstDayOfWeek: 'Mon', // 每周第一天为周一还是周日，默认按周日开始
      onlyShowCurrentMonth: false, // 日历面板是否只显示本月日期
      hideHeadOnWeekMode: false, // 周视图模式是否隐藏日历头部
      showHandlerOnWeekMode: true // 周视图模式是否显示日历头部操作栏，hideHeadOnWeekMode 优先级高于此配置
    },

    Tab: ["实验室A", "实验室B", "实验室C"],
    TabCur: 0,
    Tab2: ["上午", "中午", "下午"],
    TabCur2: 0,

    userInfo: '',

    labName: '', //实验室集合
    date: '', //当前选中的日期
    apt: '', //预约的设备列表 boolean数组
    applicant:'', //预约的申请人列表

    showBtn: false, //是否显示预约按钮，等获取数据后再显示
    showText: false, //是否弹出预约理由框

    btnIndex: '',   //当前点击的设备的下标
    btnEquipment: '',  //当前点击的设备的名称
  },

  /**
   * 进来后首先触发
   * 获取实验室所有设备数据和预约列表
   */
  onLoad: function (options) {
    const _this = this; //需转化，不然在api内this会失效
    db.collection('lab').get({
      success: res => {
        _this.setData({
          labName: res.data,
        })
        // 下面不能用new Date().toLocaleDateString()获取日期
        // 因为这样获取的日期在预览和真机调试中格式不一样，会有bug
        let d = new Date();
        let month = d.getMonth() + 1;
        if (parseInt(month) < 10) {
          month = "0" + month;
        }
        let day = d.getDate();
        if (parseInt(day) < 10) {
          day = "0" + day;
        }
        _this.data.date = d.getFullYear() + "/" + month + "/" + day;
        _this.changeTime();
      }
    });
    this.data.userInfo = app.globalData.userInfo;
  },

  /**
   * 实验室A, 实验室B, 实验室C切换
   */
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
    })
    this.changeTime();
  },

  /**
   * 上午、中午、下午切换
   */
  tabSelect2(e) {
    this.setData({
      TabCur2: e.currentTarget.dataset.id,
    })
    this.changeTime();
  },

  /**
   * 选择日期后执行的事件
   * currentSelect 当前点击的日期
   * allSelectedDays 选择的所有日期（当mulit为true时，allSelectedDays有值）
   */
  afterTapDay(e) {
    console.log('afterTapDay', e.detail); // => { currentSelect: {}, allSelectedDays: [] }
    let month = e.detail.month;
    if (parseInt(month) < 10) {
      month = "0" + month;
    }
    let day = e.detail.day;
    if (parseInt(day) < 10) {
      day = "0" + day;
    }
    const date = e.detail.year + "/" + month + "/" + day;
    this.setData({
      date: date,
    })
    this.changeTime();
  },

  /**
   * 当日历滑动时触发(适用于周/月视图)
   * 可在滑动时按需在该方法内获取当前日历的一些数据
   */
  onSwipe(e) {
    console.log('onSwipe', e.detail);
    const dates = this.calendar.getCalendarDates();
  },

  /**
   * 当改变月份时触发
   * => current 当前年月 / next 切换后的年月
   */
  whenChangeMonth(e) {
    console.log('whenChangeMonth', e.detail);
  },

  /**
   * 周视图下当改变周时触发
   * => current 当前周信息 / next 切换后周信息
   */
  whenChangeWeek(e) {
    console.log('whenChangeWeek', e.detail);
  },

  /**
   * 日历初次渲染完成后触发事件，如设置事件标记
   */
  afterCalendarRender(e) {
    console.log('afterCalendarRender', e);
  },

  /**
   * 改变实验室或时间后
   * 先获取预约表，再筛选被预约的设备
   * 后显示到前端
   */
  changeTime() {
    const _this = this;
    //获取当前日期的00:00:00点
    let apt = [];
    let applicant = [];
    db.collection('appointment').where({
      labName: _this.data.Tab[_this.data.TabCur],
      time: _this.data.Tab2[_this.data.TabCur2],
      date: _this.data.date,
    }).get({
      success: function (res) {
        console.log("预约记录：", res.data);
        //筛选哪些设备被预约了
        for (let i = 0; i < _this.data.labName[_this.data.TabCur].equipment.length; i++) {
          let flag = 0;
          for (let j = 0; j < res.data.length; j++) {
            //如果设备列表在预约表中有记录，则apt为true
            if (_this.data.labName[_this.data.TabCur].equipment[i] == res.data[j].equipment) {
              apt.push(true);
              applicant.push(res.data[j].userName)
              flag = 1;
              break;
            }
          }
          if (flag == 0) {
            apt.push(false);
            applicant.push('')
          }
        }
        _this.setData({
          apt: apt,
          showBtn: true,
          applicant:applicant,
        })
        console.log("预约列表", apt)
        console.log("applicant", applicant)
      }
    })
  },

  /**
   * 点击预约按钮后保存数据，弹出预约框
   */
  btnApointment(e) {
    const index = e.currentTarget.dataset.index;
    const equipment = this.data.labName[this.data.TabCur].equipment[index];
    this.setData({
      showText: true, //弹出预约理由框
      btnEquipment: equipment,
      btnIndex: index,
    })
  },

  /**
   * 点击预约框的确定后提交数据到数据库
   * @param {*} e 
   */
  submitAppointment(e) {
    const _this = this;
    let reason = e.detail.value.reason;
    if (reason == '') {
      reason = "无";
    }
    const equipment = this.data.btnEquipment;
    const index = this.data.btnIndex;
    const getCheck = this.checkSubmit(index);
    getCheck.then(check => { //使用promise
      if (check) { //验证是否可预约
        db.collection('appointment').add({
          data: {
            date: _this.data.date,
            equipment: equipment,
            labName: _this.data.Tab[_this.data.TabCur],
            time: _this.data.Tab2[_this.data.TabCur2],
            userName: app.globalData.userInfo.userName,
            reason: reason,
          },
          success: res => {
            console.log(res)
            _this.setData({
              ['apt[' + index + ']']: true, //点击‘预约’后设为不可点击，防止重复提交
            })
            wx.showToast({
              title: '预约成功！',
              icon: 'success',
              duration: 1500
            })
          },
          fail: res => {
            wx.showToast({
              title: '预约失败，请稍后再试！',
              icon: 'none',
              duration: 1500
            })
          }
        })
      } else {
        wx.showToast({
          title: '预约失败，请刷新后再试！',
          icon: 'none',
          duration: 1500
        })
      }
    })
    this.hideModal();
  },

  /**
   * 提交预约之前检查该时间点是否有人已经预约了
   * 防止没刷新，导致多人预约同一时间,通过返回true，否则false
   */
  checkSubmit(index) {
    const _this = this;
    const equipment = this.data.labName[this.data.TabCur].equipment[index];
    return new Promise(function (resolve, reject) {
      db.collection('appointment').where({
        date: _this.data.date,
        equipment: equipment,
        labName: _this.data.Tab[_this.data.TabCur],
        time: _this.data.Tab2[_this.data.TabCur2],
      })
        .get({
          success: res => {
            if (res.data.length == 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        })
    })
  },

  /**
   * 在预约理由框中点击取消
   */
  hideModal(e) {
    this.setData({
      showText: false,
      inputReason: '',
    })
  },
})
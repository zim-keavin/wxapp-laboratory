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

    labName: '',   //实验室集合
    date: '',     //当前选中的日期
    apt:'',       //预约的设备列表 boolean数组

  },

  /**
   * 进来后首先触发
   * 获取实验室所有设备数据
   */
  onLoad: function(options) {
    const _this = this; //需转化，不然在api内this会失效
    db.collection('lab').get({
      success: function(res) {
        _this.setData({
          labName: res.data,
        })
      }
    });
    this.data.date = new Date().toLocaleDateString();
    this.changeTime();
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
    const date = e.detail.year + "/" + e.detail.month + "/" + e.detail.day;
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
    // => { current: { month: 3, ... }, next: { month: 4, ... }}
  },

  /**
   * 周视图下当改变周时触发
   * => current 当前周信息 / next 切换后周信息
   */
  whenChangeWeek(e) {
    console.log('whenChangeWeek', e.detail);
  },

  /**
   * 日期点击事件（此事件会完全接管点击事件），需自定义配置 takeoverTap 值为真才能生效
   * currentSelect 当前点击的日期
   */
  onTapDay(e) {
    console.log('onTapDay', e.detail); // => { year: 2019, month: 12, day: 3, ...}
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
    const today = new Date(Date.parse(new Date().toLocaleDateString()));
    let apt = [];
    db.collection('appointment').where({
      labName: _this.data.Tab[_this.data.TabCur],
      time: _this.data.Tab2[_this.data.TabCur2],
      date: _this.data.date,
    }).get({
      success: function(res) {
        console.log("预约记录：", res.data);
       //筛选哪些设备被预约了
        for (let i = 0; i < _this.data.labName[_this.data.TabCur].equipment.length; i++) {
          let flag = 0;
          for (let j = 0; j < res.data.length; j++) {
       //如果设备列表在预约表中有记录，则apt为true
            if (_this.data.labName[_this.data.TabCur].equipment[i] == res.data[j].equipment) {
              apt.push(true);
              flag = 1;
              break;
            }
          }
          if (flag == 0) {
            apt.push(false);
          }
        }
        _this.setData({
          apt:apt
        })
        console.log("预约列表", apt)
      }
    })

  },

  /**
   * 预约
   */
  addApointment(e) {
    console.log("你点击了预约", e.currentTarget.dataset.index)
  }
})
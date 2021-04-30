const app = getApp()
var options = {canvasXYWH:{} , headerXYWH:{} , contentXYWH:{} , userImgXYWH:{} , codeXYWH:{} , footerXYWH:{}};
Component({
  
  properties: {
    //属性值可以在组件使用时指定
 
  },
  data: {
    // 组件内部数据
    mask:false ,
    continuity_date: 0, // 用户打卡天数
    personalInfo: {}, // 用户个人资料
    poster: '', // 海报图片路径
    today:"" , 
    AppletsCode:"" ,
    posterPath: '', // 海报图片路径
    posterInfo: {}, // 海报图片的基本信息
    avatarPath: '', // 用户头像路径
    avatarInfo: {}, // 用户头像的基本信息
    canvasWH:{} , //总画布的(宽高)
    codePath:"" , //小程序二维码路径
    testSrc:""
  },
  attached(){
 
    this.getPersonalInfo();
    this.getPoster();
    this.getAppletsCode();
    this.getDomWH('#mask-canvas' , "canvasXYWH");
    this.getDomWH('#mask-header' , "headerXYWH");
    this.getDomWH('#mask-content', "contentXYWH");
    this.getDomWH('#mask-code', "codeXYWH");
    this.getDomWH('#mask-userimg', "userImgXYWH");


    

    
   
    
  } ,


  

  //自定义方法
  methods: {

    /**
     * 获取元素的不同设备的宽高
     */
    getDomWH(eleId ,type){
      let _this = this;
      const query = this.createSelectorQuery()
      query.select(eleId).boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function (res) {
        options[type] = res[0]
        if(type == "canvasXYWH"){
          _this.setData({
            canvasWH:res[0]
          })
        }
      })
    } ,


    onClearCatch(){} ,
    /**
     * 分享弹窗
     */ 
    onChangeMask(e){
      this.setData({
        mask:parseInt(e.currentTarget.dataset.maskvalue) ? true : false
      })
    } ,  
    /**
     * 获取用户个人资料
     */
    getPersonalInfo () {
      let that = this
      let token = wx.getStorageSync('token');
      app.http({
        config: {
          url: '/api/User/personal_info',
          data: {
            token
          },
          method: 'POST'
        },
        isAuth: true
      }).then(res => {
        let time = new Date()
        let year = time.getFullYear()
        let month = time.getMonth() + 1
        let date = time.getDate()
        let today = `${year}年${month}月${date}日`
        let avatarPath = res.data.data.avatar
        that.setData({
          personalInfo: res.data.data,
          continuity_date: res.data.data.continuity_date ,
          today
        })
         // 获取图片基本信息
        wx.getImageInfo({
        src: avatarPath,
        success: function(response) {
          that.setData({
            avatarInfo: response,
            avatarPath: response.path
          })
        }
      })
      }).catch(err => {
        console.log(err, 'personalInfoErr')
      })
    },

     /**
     * 获取小程序二维码
     */
    getAppletsCode () {
      let that = this
      let token = wx.getStorageSync('token');
      app.http({
        config: {
          url: '/api/User/system_images',
          data: {
            token ,
            type:1
          },
          method: 'POST'
        },
        isAuth: true
      }).then(res => {
       that.setData({
        AppletsCode:res.data.data.image_url
       })

        // 获取图片基本信息
      wx.getImageInfo({
        src: res.data.data.image_url ,
        success: function(response) {
          that.setData({
            codePath: response.path ,
          })
        }
      })
      
      }).catch(err => {
        console.log(err)
      })
    },

      /**
   * 获取海报
   */
  getPoster () {
    let that = this
    let token = wx.getStorageSync('token')
    app.http({
      config: {
        url: '/api/User/poster',
        data: {
          token
        },
        method: 'GET'
      },
      isAuth: true
    }).then(res => {
      this.setData({
        poster: res.data.data
      })

      // 获取图片基本信息
      wx.getImageInfo({
        src: res.data.data,
        success: function(response) {
          console.log(response , "!1111111111111111111")
          that.setData({
            posterPath: response.path ,
            posterInfo: response,
          })
        }
      })

    }).catch(err => {
      console.log(err, 'posterErr')
    })
  },
  /**
   * 绘制海报
   */
  drawImage() {
    let that = this
    // 海报背景图基本信息
    let posterPath = that.data.posterPath
    // 用户头像基本信息
    let avatarPath = that.data.avatarPath
    // 小程序二维码路径
    let codePath = this.data.codePath


    // 获取canvas对象
    let ctx = wx.createCanvasContext('myCanvas' , this)
    ctx.setFillStyle('#FFDEAD') // 设置canvas背景色, 否则制作的图片是透明的
    ctx.fillRect(0, 0, 320, 442) // 背景色填充满整个画布

    ctx.drawImage(posterPath, 10, 10, 300, 289) // 先绘制海报背景图，撑满整个画布

    ctx.setFillStyle('#ffffff') // 设置canvas背景色, 否则制作的图片是透明的
    ctx.fillRect(10, 320, 195, 87) // 背景色填充满整个画布

    ctx.setFillStyle('#ffffff') // 设置canvas背景色, 否则制作的图片是透明的
    ctx.fillRect(220, 320, 90, 87 ) // 背景色填充满整个画布
    ctx.drawImage(codePath, 220, 320, 90, 87) // 小程序二维码

    
    
    ctx.drawImage(avatarPath, 15, 338.5, 50 , 50) // 用户头像

    ctx.setFontSize(12)
    ctx.fillStyle = "red" // 设置字体颜色
    let userName = this.data.personalInfo.nickname;
    if(this.data.personalInfo.nickname.length > 11){
        userName = this.data.personalInfo.nickname.substring(-1,10) + '...'
    }
    ctx.fillText(userName, 70 , 350.5)

    ctx.setFontSize(8)
    ctx.fillStyle = "#000000" // 设置字体颜色
    ctx.fillText(`日期:${this.data.today}`, 70 , 360.5)
    ctx.fillText(`我在广东盛和塾已累计打卡${this.data.continuity_date}天`, 70 , 370.5 )
    ctx.fillText(`识别二维码，和我一起坚持每日精进`, 70 , 380.5 )





   
     
   
    ctx.draw(false , function(){
    
          
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width:320 ,
            height:442 ,
            destWidth: 320*3,
            destHeight: 442*3,
            canvasId: 'myCanvas',
            success: function (res) {
            console.log(res.tempFilePath , "1")   
            that.imageLogin(res.tempFilePath)
            },
            fail: function (err) {
              console.log(err , "2")  
            },
            complete: function (com) {
              console.log(com , "3")  
            }
          } , that)
        })

     
  }, 


  longPressSaveImg(){
    this.drawImage()
  } ,

  imageLogin(url){
    let that = this;
    wx.getSetting({
      success: (res) =>{
        //authSetting用户授权设置信息(用户授权结果)
        //是否授权保存到相册 boolean scope.writePhotosAlbum
        //如果值为undefined:以前没有授权过或者以前第一次点了拒绝之类的
        if(res.authSetting['scope.writePhotosAlbum'] == undefined) {
          // wx.authorize是否开启授权（去申请获取权限） 掉起授权弹窗
          //首先得开启authorize,才能去判断到底是true或者false
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () =>{
              //同意授权
              that.saveImg1(url)
            },
            fail:(res) =>{
            }
          })
        } else if(res.authSetting['scope.writePhotosAlbum'] == false) {
          that.authConfirm()
        } else {
          //已经授权了
          that.saveImg1(url);
        }
      },
      fail:(res) =>{
        console.log(res)
        that.authConfirm()
      }
    })
  } , 


  //去获取用户权限
authConfirm() {
  let that = this
  wx.showModal({
    content: '检测到您没打开保存图片权限，是否去设置打开？',
    confirmText: "确认",
    cancelText: "取消",
    success:function(res) {
      console.log(res)
      if(res.confirm) {
        // 唤醒小程序自带右上角的设置界面
        wx.openSetting({
          success(res) {
            if(res.authSetting['scope.writePhotosAlbum']){
              //that.saveImg1()
            } else {
              wx.showToast({
                title:'您没有授权,无法保存到相册',
                icon:'none'
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '您没有授权，无法保存到相册',
          icon: 'none'
        })          
      }
    }      
  })
},

//保存到本地
saveImg1(url) {
  wx.showLoading({
    title: '保存中',
    mask: true
  })
  //获取图片信息
  wx.getImageInfo({
    src: url,
    success: (res) =>{
      let path = res.path;
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: (res) => {
          if (res.errMsg == 'saveImageToPhotosAlbum:ok') {
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
          }
        },
        fail: (res) => {
        } ,
        complete(){
          wx.hideLoading()
        }
      })
    },
    fail:(res) =>{}
  })
},



  }

})
/**
 * 通讯发送
 * */
$(function () {

    function send(action, data) {

        data.action = action;

        ws.send(JSON.stringify(data));
    }

    /**
     *
     * 初始化颜色
     * */
    function initColor() {
        setTimeout(function () {
            let tank = $(".Tank");
            var html = "<style> \n\r";
            for (var i = 0; i < tank.length; i++) {
                let color = tank.eq(i).attr("color");
                html += "." + color + "{ \n background:#" + color + "\n}\n";
            }

            html += "</style>"
            $("#style").html(html)
        }, 200)
    }

    /**
     * 创建坦克
     *  @param setcolor  坦克颜色
     * **/
    function createTank(id, setcolor) {

        let direction = 'w';
        let xy = {
            left: Math.round(Math.random() * (config.maxW - 50)) + "px",
            top: Math.round(Math.random() * (config.maxH - 50)) + "px"
        }
        let tank = document.createElement("div");
        let top = document.createElement("div");
        let heade = document.createElement("div");
        // let name = document.createElement("div");
        $(tank).addClass("Tank");

        $(tank).attr("gameid", id);
        $(tank).attr("color", setcolor);
        $(tank).addClass(setcolor);

        $(top).addClass("top");
        $(top).addClass(setcolor);
        $(tank).css(xy)
        $(heade).addClass("heade");
        $(heade).addClass(setcolor);
        $(heade).text(config.Life);
        $(tank).append(top);
        $(tank).append(heade);
        $("#box").append(tank)

        config.die = false;
        setDirection(id, direction)
        initColor()

        if (id == config.id) {
            setTimeout(() => {
                move(id)
            }, 100)
        }

        return xy
    }

//碰撞检测
    function isBump(obj1, obj2) {
        var L1 = obj1.offsetLeft;
        var R1 = obj1.offsetLeft + obj1.offsetWidth;
        var T1 = obj1.offsetTop;
        var B1 = obj1.offsetTop + obj1.offsetHeight;
        var L2 = obj2.offsetLeft + obj2.parentNode.offsetLeft;
        var R2 = obj2.offsetLeft + obj2.offsetWidth + obj2.parentNode.offsetLeft;
        var T2 = obj2.offsetTop + obj2.parentNode.offsetTop;
        ;
        var B2 = obj2.offsetTop + obj2.offsetHeight + obj2.parentNode.offsetTop;
        if (R1 < L2 || L1 > R2 || T1 > B2 || B1 < T2) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 坦克移动
     * @param div   坦克
     * @param type  方向
     * @param color  颜色
     */
    function move(id, type = "w") {
        let Tank = $(".Tank[gameid='" + id + "']")
        let tankW = Tank.width();
        let tankH = Tank.height();
        let tankL = parseInt(Tank.css("left"));
        let tankT = parseInt(Tank.css("top"));
        if (config.fz == false) {
            config.fz = true
            setTimeout(function () {
                config.fz = false
            }, 20)
        } else {
            return false
        }

        switch (type) {
            case "w":
                config.direction = type;
                tankT -= 10;
                if (tankT <= 0) {
                    tankT = 0;
                }
                Tank.css("top", tankT);
                break;
            case "s":
                config.direction = type;
                tankT += 10;
                if ((tankT + tankH) >= 2000) {
                    tankT = config.maxH - tankH
                }
                Tank.css("top", tankT)


                break;
            case "a":
                config.direction = type;
                tankL -= 10;
                if (tankL <= 0) {
                    tankL = 0
                }
                Tank.css("left", tankL)

                break;
            case "d":
                config.direction = type;
                tankL += 10;
                if ((tankL + tankW) >= 2000) {
                    tankL = config.maxW - tankW
                }
                Tank.css("left", tankL)

                break;
            case "Enter":
                emission(id, config.direction);
                send("launch", {type: config.direction, id: id})
                break;

        }
        if (id == config.id) {
            Boxcenter(Tank);
        }
        setDirection(id, config.direction)

        let data = {};
        data.xy = {left: tankL, top: tankT}
        data.type = config.direction;
        data.id = config.id;
        return data
    }

    //跟随镜头
    function Boxcenter(Tank) {

        let tankL = parseInt(Tank.css("left"));
        let tankT = parseInt(Tank.css("top"));
        let left, top
        top = 0 - (tankT - (config.deviceH / 2))
        left = 0 - (tankL - (config.deviceW / 2))

        if (top >= 0) {
            top = 0;
        } else if (top <= -(config.maxH - config.deviceH)) {
            top = -(config.maxH - config.deviceH)

        }
        if (left >= 0) {
            left = 0;
        } else if (left <= -(config.maxW - config.deviceW)) {
            left = -(config.maxW - config.deviceW)
        }
        $("#box").css("top", top);
        $("#box").css("left", left);
    }

    setInterval(Mark, 20)
    setInterval(Kt, 20)

//飞机
    function airdrop(id, x, y) {
        layer.msg("空投已到达战场!")
        createAirdrop(id, x, y)
        let top = $(window).height() / 2 - 250;
        let left = $(window).width() + 200;
        $("#Aircraft").css("top", top)
        $("#Aircraft").css("left", left)
        $("#Aircraft").animate({left: -$("#Aircraft").width() + "px"}, 5000)
    }

// 空投
    function createAirdrop(id, x, y) {
        let kt = document.createElement("div")
        $(kt).attr("kt", id)
        $(kt).css("left", x)
        $(kt).css("top", y)
        $(kt).addClass("airdrop")
        $("#box").append(kt)
    }

// 坦克追踪
    function Mark() {
        let tank = $(".Tank");
        let double = $("#map").width() / $("#box").width()
        $("#map").html("");

        //空投
        let airdrop = $(".airdrop");
        for (let ia = 0; ia < airdrop.length; ia++) {
            let aitop = parseInt(airdrop.eq(ia).css("top"))
            let aileft = parseInt(airdrop.eq(ia).css("left"))
            let drop = document.createElement("div")
            $(drop).addClass("drop");
            $(drop).css({top:aitop * double, left: aileft * double});
            $("#map").append(drop)
        }


        for (let i = 0; i < tank.length; i++) {
            let id = tank.eq(i).attr("gameid");
            let top = parseInt(tank.eq(i).css("top"))
            let left = parseInt(tank.eq(i).css("left"))
            let color = tank.eq(i).attr("color")
            if (id == config.id) {
                let point = document.createElement("div")
                $(point).addClass("point");
                $(point).addClass("square");
                $(point).addClass(color);
                $(point).css({top: top * double, left: left * double})
                $("#map").append(point)
            } else {
                if(tank.eq(i).is(".hide")){

                    return;
                }
                let point = document.createElement("div")
                $(point).addClass("point");
                $(point).addClass(color);
                $(point).addClass();
                $(point).css({top: top * double, left: left * double})
                $("#map").append(point)
            }

        }




    }

// 空投

    function Kt() {
        let kt = $(".airdrop");

        for (let i = 0; i < kt.length; i++) {
            let tank = $(".Tank[gameid='" + config.id + "']");

            let tkt = kt.eq(i);
            let ktid = tkt.attr("kt");
            let t1 = tank.offset().top <= tkt.offset().top + tkt.height()
            let t2 = tank.offset().top >= tkt.offset().top
            let t3 = tank.offset().left <= tkt.offset().left + tkt.width()
            let t4 = tank.offset().left >= tkt.offset().left
            if (t1 && t2 && t3 && t4) {
                tkt.remove();
                delAirdrop(ktid)
                send("removeKt", {id: ktid})
                hide(config.id)

            }
        }


    }

    /**
     * 设置坦克方向
     * @param div   坦克
     * @param type  方向
     */
    function setDirection(id, type = "w") {
        let div = $(".Tank[gameid='" + id + "']").find(".top")
        switch (type) {
            case "w":
                div.removeAttr("style");
                div.css({"top": "2px", "left": "21px"});
                break;
            case "s":
                div.removeAttr("style");
                div.css({"bottom": "-40px", "left": "21px"});
                break;
            case "a":
                div.removeAttr("style");
                div.css({
                    "bottom": "-21px",
                    "left": "2px",
                });
                break;
            case "d":
                div.removeAttr("style");
                div.css({
                    "bottom": "-21px",
                    "right": "-40px",
                });
                break;
        }

    }

    /**
     *  创建子弹
     * @param div  坦克元素
     * @param direction 方向
     * @param color 颜色
     * @returns {boolean|*|jQuery|HTMLElement}
     */
    function createBullet(id, type = "w") {

        if ($(".Bullets[gameid='" + id + "']").length >= config.num) {
            return
        }

        let div = $(".Tank[gameid='" + id + "']").find('.top')
        let xy = div.offset();
        var diva = document.createElement("div");
        $(diva).addClass("Bullets");
        $(diva).attr("gameid", id);
        $(diva).addClass($(".Tank[gameid='" + id + "']").attr("color"));

        switch (type) {
            case "w":
                xy.top -= 1;
                break;
            case "s":
                xy.top += 1;
                break;
            case "a":
                xy.left -= 1;
                break;
            case "d":
                xy.left += 1;
                break;
        }
        $(diva).offset(xy);
        $("#box").append(diva);

    }

    /**
     *  创建子弹移动
     * @param div 坦克元素
     * @param direction 方向
     * @param color 颜色
     */
    function emission(id, type = "w") {
        let div = $(".Tank[gameid='" + id + "']").find(".top")
        if (!div || $(".Bullets[gameid='" + id + "']").length >= config.num) {
            return
        }


        let xy = div.offset();
        createBullet(id, type);
        let diva = $(".Bullets[gameid='" + id + "']")
        let timer = setInterval(function () {
            switch (type) {
                case "w":
                    if (diva) {
                        xy.top -= 15;
                        if (xy.top <= 0) {
                            diva.remove();
                            clearInterval(timer)
                        }

                    }
                    break;
                case "s":
                    if (diva) {
                        xy.top += 15;
                        if (xy.top >= config.maxH) {
                            diva.remove();
                            clearInterval(timer)
                        }

                    }
                    break;
                case "a":
                    if (diva) {
                        xy.left -= 15;
                        if (xy.left <= 0) {
                            diva.remove();
                            clearInterval(timer)
                        }

                    }
                    break;
                case "d":
                    if (diva) {
                        xy.left += 15;
                        if (xy.left >= config.maxW) {
                            diva.remove();
                            clearInterval(timer)
                        }
                    }
                    break;
            }
            diva.offset(xy)
            for (var i = 0; i < $(".Tank").length; i++) {
                let left = $(".Tank").eq(i).offset().left;
                let top = $(".Tank").eq(i).offset().top;
                let w = $(".Tank").eq(i).width();
                let h = $(".Tank").eq(i).height();

                if ((xy.top >= top && xy.top <= top + h) && (xy.left >= left && xy.left <= left + w) && $(".Tank").eq(i).attr("gameid") != id) {
                    clearInterval(timer);
                    diva.remove();
                    hit($(".Tank").eq(i).attr("gameid"))

                }


            }

        }, 10)
    }

// 扣除血量
    function hit(id) {
        let tank = $(".Tank[gameid='" + id + "']");
        let num = parseInt(tank.find(".heade").text());
        if (num <= 1) {
            send("boom", {"id": id});
            gameover(id)
        } else {
            num--;
            tank.find(".heade").text(num)
        }
    }

    /**
     *  爆炸
     * @param color 颜色
     */
    function gameover(id) {

        let div = $(".Tank[gameid='" + id + "']");
        div.html($("#boom").html())
        div.css("background", "transparent")
        let xg = true;

        var timer = setInterval(function () {
            if (xg == true) {
                xg = false;
                div.css("transform", "scale(1.5)");

            } else {
                xg = true;
                div.css("transform", "scale(0.5)");
            }

        }, 200)


        setTimeout(function () {
            clearInterval(timer)
            div.remove();

            if (config.id == id && config.die == false) {
                config.die = true;
                layer.confirm('机甲已被机毁是否重新复活？', {
                    btn: ['逆袭', '继续狗带']
                }, function () {
                    layer.msg("正在为您重新生成机甲")
                    let xy = createTank(config.id, config.color)
                    send("create", {color: config.color, id: config.id, xy: xy})
                }, function () {
                    let data = {
                        "people": config.people - 1,
                        "id": config.id
                    }
                    config.people -= 1
                    send("GameOver", data)
                    return;
                })
            }
        }, 1000)


    }

// 重力感

    let ws = new WebSocket("wss://tank.aimengyuan.top:9510")
    let config = {
        maxW: 2000,
        maxH: 2000,
        deviceW: $(window).width(),
        deviceH: $(window).height(),
        num: 5,
        direction: "w",
        color: '',
        fz: false,
        people: 0,
        die: false,
        id: "",
        Life: 0

    }
    ws.onmessage = function (e) {
        let data = JSON.parse(e.data);
        document.title = "坦克(在线" + data.people + "人)"
        switch (data.action) {
            case 'create':
                createTank(data.id, data.color)
                send("synchronous",{id:data.id,"html":$("#box").html()})
                break;

            case "synchronous":
                if(data.id==config.id){
                    $("#box").html(data.html)
                }
                break;
            case "setWindows":
                config.maxH = data.maxH
                config.maxW = data.maxW
                $("#box").css("width", config.maxW)
                $("#box").css("height", config.maxH)
                $("#box").css("border", "1px solid #333")

                break;
            case "boom":
                gameover(data.id)
                break;
            case "join":
                if (data.id) {
                    config.color = data.color
                    config.id = data.id
                    config.Life = data.Life
                    let xy = createTank(data.id, data.color)
                    send("create", {color: data.color, id: config.id, xy: xy})
                } else {
                    alert("请刷新重试")
                }
                break;
            case "destroy":
                $(".Tank[gameid='" + data.id + "']").remove()
                break;
            case "move":

                $(".Tank[gameid='" + data.id + "']").css({
                    "top": data.xy.top,
                    "left": data.xy.left
                });
                setDirection(data.id, data.type)
                break;
            case "launch":
                emission(data.id, data.type)
                break;
            case "synchronous":
                $("#box").html(data.html)
                break;
            case "close":
                $(".Tank[gameid='" + data.id + "']").remove()
                break;
            case "airdrop":

                if ($(".airdrop").length < data.people) {
                    airdrop(data.id, data.x, data.y);
                }
                break;
            case "removeKt":
                delAirdrop(data.id)
                break;
            case "hide":
                if(data.type==1){
                    $(".Tank[gameid='"+data.id+"']").addClass("hide");
                }else{
                    $(".Tank[gameid='"+data.id+"']").removeClass("hide");
                }

                break;
            case "hit":

                hit(data.id)

                break;
        }
    }
    ws.onclose = function () {
        alert("服务器重启请刷新页面重新连接");
    }

    function isMobile() {

        var system = {};
        var p = navigator.platform;
        system.win = p.indexOf("Win") == 0;
        system.mac = p.indexOf("Mac") == 0;
        system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
        if (system.win || system.mac || system.xll) {//如果是电脑跳转到
            return false;
        } else {  //如果是手机,跳转到
            return true
        }
    }

    function delAirdrop(id) {
        $(".airdrop[kt='" + id + "']").remove();

    }

// 隐身
    function hide(id) {
       let num=30;
       let timer= setInterval(function(){
           send("hide",{id:id,"type":1})
           num--;
          if(num<=0){
              send("hide",{id:id,"type":0})
              clearInterval(timer)


          }

        },1000)


    }



    if (isMobile()) {
        //判断是否支持重力感应
        alert("滑动屏幕移动 点击屏幕射击")

        let joyCon = document.querySelector("#Joycon");
        let options = {
            zone: joyCon,
            mode: "static",// 'dynamic', 'static' or 'semi'
            size: 100,
            position: {
                left: "0%",
                bottom: "0%"
            },//在容器内垂直居中显示
            multitouch:true,
            maxNumberOfNipples:2,

        }
        let manager = nipplejs.create(options);
        let anTimer;
        let moveT;
        let jc = 0;

        $("body").click(function () {

            emission(config.id, config.direction);
            send("launch", {id: config.id, type: config.direction})

        })

        manager.on("start", function (evt, data) {
            jc = 0;
            clearInterval(anTimer)
            anTimer = setInterval(function () {
                jc++;
                if (jc >= 10) {
                    let sendData = move(config.id, moveT)

                    if (send) {
                        send("move", sendData)

                    }
                    // deviceMotionHandler(moveT);
                }
            }, 1)


        });
        manager.on("move", function (evt, data) {
            if (data.direction) {
                switch (data.direction.angle) {
                    case "up":
                        data.direction.angle = "w"
                        break;
                    case "down":
                        data.direction.angle = "s"
                        break;
                    case "left":
                        data.direction.angle = "a"
                        break;
                    case "right":
                        data.direction.angle = "d"
                        break;

                }
                moveT = data.direction.angle
            }
        });

        manager.on("end", function (evt, data) {
            clearInterval(anTimer)
            if (jc < 30) {
                moveT = ""
                emission(config.id, config.direction);
                send("launch", {id: config.id, type: config.direction})
            }

        });


    } else {

        alert("W,S,A,D 方向  Enter射击")
        $("body").keydown(function (e) {
            if (config.die) {
                return
            }
            let data = move(config.id, e.key);
            if (data) {
                send("move", data)

            }
        })

    }

    setTimeout(function () {

        $(window).scrollLeft(0)
        $(window).scrollTop(0)
    }, 30)


})

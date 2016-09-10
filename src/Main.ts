class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;
    private times:number;
    private webSocket:egret.WebSocket;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        // RES.loadGroup("preload");
        RES.loadGroup("heroes");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "heroes") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {
        var bg:egret.Shape = new egret.Shape();
        bg.graphics.beginFill( 0x336699 );
        bg.graphics.drawRect( 0, 0, this.stage.stageWidth, this.stage.stageHeight);
        bg.graphics.endFill();
        super.addChild(bg);

        var hero01:egret.Bitmap = new egret.Bitmap(RES.getRes('hero-01'));
        hero01.x = 30;
        hero01.y = 20;
        this.addChild(hero01);

        var captain:egret.Bitmap = new egret.Bitmap( RES.getRes("hero-02") );
        captain.x = 65;
        captain.y = 20;
        this.addChild( captain );
        var superman:egret.Bitmap = new egret.Bitmap( RES.getRes("hero-03") );
        superman.x = 100;
        superman.y = 20;
        this.addChild( superman );
        var hulk:egret.Bitmap = new egret.Bitmap( RES.getRes("hero-04") );
        hulk.x = 135;
        hulk.y = 20;
        this.addChild( hulk );
        this.setChildIndex( superman, this.getChildIndex( hulk ));
        this.setChildIndex( captain, 20 );

        hulk.anchorOffsetX = 30;
        hulk.anchorOffsetY = 40;
        hulk.x += 30;
        hulk.y += 40;

        this.times = -1;
        var self = this;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, function() {
            switch( ++self.times % 3 ) {
                case 0: 
                    egret.Tween.get( hero01 ).to( { x:captain.x }, 300, egret.Ease.circIn);
                    egret.Tween.get( captain ).to( { x:hero01.x }, 300, egret.Ease.circIn);
                    break;
                case 1: 
                    egret.Tween.get( superman ).to( { alpha:.3 }, 300, egret.Ease.circIn ).to( { alpha:1 }, 300, egret.Ease.circIn );
                    break;
                case 2:
                    egret.Tween.get( hulk ).to( { scaleX:1.4, scaleY:1.4 }, 500, egret.Ease.circIn ).to( { scaleX:1, scaleY:1 }, 500, egret.Ease.circIn );
                    var soundBonus:egret.Sound = RES.getRes( 'bonus.mp3' );
                    var channel:egret.SoundChannel = soundBonus.play(0, 1);
                    break;
            }
        }, this);

        var urlreq:egret.URLRequest = new egret.URLRequest( "http://httpbin.org/user-agent" );
        var urlloader:egret.URLLoader = new egret.URLLoader(); 
        urlloader.addEventListener( egret.Event.COMPLETE, function( evt:egret.Event ):void{
            console.log(evt.target.data);
        }, this );
        urlloader.load( urlreq );

        this.webSocket = new egret.WebSocket();
        this.webSocket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReceiveMessage, this);
        this.webSocket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.webSocket.connect("echo.websocket.org", 80)
    }

    private onSocketOpen():void {    
        var cmd = "Hello Egret WebSocket";    
        console.log("The connection is successful, send data: " + cmd);    
        this.webSocket.writeUTF(cmd); 
    }

    private onReceiveMessage(e:egret.Event):void {    
        var msg = this.webSocket.readUTF();    
        console.log("Receive data:" + msg); 
    }

    private touchHandler( evt:egret.TouchEvent ):void{
        var tx:egret.TextField = evt.currentTarget;
        tx.textColor = 0x00ff00; 
    }
}
/**
 *  Yahho Uploader
 *  @see http://0-oo.net/sbox/javascript/yahho-uploader
 *  @version 0.2.2a
 *  @copyright 2008-2010 dgbadmin@gmail.com
 *  @license http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 */

/**
 *  コンストラクタ
 */
var YahhoUpl = function() {};

/**
 *  各種設定（やりたいことに合わせて上書きする）
 */
YahhoUpl.prototype = {
    /**
     *  loadYUI()で読み込むYUIのURL
     *  @see http://developer.yahoo.com/yui/articles/hosting/
     *  @see http://code.google.com/intl/en/apis/libraries/devguide.html#yui
     */
    YUI_URL: {
        SERVER: location.protocol + "//ajax.googleapis.com/ajax/libs/yui/",
        VERSION: "2.7.0",
        DIR: "/build/"
    },

    /** ファイル選択ダイアログで表示するファイル種類 */
    filterText: "JPEG画像",

    /** ファイル選択ダイアログで選択可能な拡張子 */
    filterExtensions: ["jpg", "jpeg"],

    /** ファイルをPOSTするフィールド名 */
    postKey: "Filedata",

    /** ファイルと一緒にPOSTするデータ */
    postVars: {},

    /** アップロード可能なファイル数 */
    maxCount: 1,

    /** 1ファイル当たりのファイルサイズ制限（単位はMB） */
    maxSize: 10,
    
    /** アップロード中のマウスカーソルの形（ex: auto, progress, wait） */
    cursor: "wait",

    /**
     *  アップロード開始時のコールバック関数
     *  @param  Object  fileList    アップロードする全ファイルの情報
     */
    onStart: function(fileList) {},

    /**
     *  各ファイルごとのアップロード完了時のコールバック関数
     *  @param  String  id  ファイルID
     */
    onComplete: function(id) {},

    /**
     *  全各ファイルアップロード完了時のコールバック関数
     */
    onCompleteAll: function() {},

    /**
     *  アップロードエラー時のコールバック関数
     *  @param  String  id          ファイルID
     *  @param  Number  httpStatus  HTTPステータス
     *  @param  String  errorInfo   エラー情報
     */
    onError: function(id, httpStatus, errorInfo){
        alert("エラーが発生したためアップロードを中止しました。（" + httpStatus + "）");
    },

    /** プログレスバーのスタイル */
    progressBarStyle: {
        box: {
            padding: 0, width: "20em", height: "1em", backgroundColor: "#fff",
            border: "1px #000 solid"
        },
        bar: {
            margin: 0, height: "100%", backgroundColor: "#0f0", borderStyle: "none"
        }
    }
};
/**
 *  設定を取り込んでセットアップ
 *  @param  String  buttonId    ボタン表示場所のid属性
 *  @param  String  barId       プログレスバーのid属性
 *  @param  String  uploadUrl   アップロード先のURL（外部のYUIを使う場合はhttp://から）
 *  @param  String  btnImgUrl   ボタン画像のURL
 */
YahhoUpl.prototype.setUp = function(buttonId, barId, uploadUrl, btnImgUrl) {
    try {
        var upl = (this.upl = this.getYUIUploader(buttonId, btnImgUrl));
    } catch(e) {
        alert("ファイルをアップロードするには、Flash Player（バージョン9.0.45以降）が必要です。");
        return;
    }
    var pBar = this.getProgressBar(barId);
    var bar = pBar.bar;
    var self = this;
    var bodyStyle = document.body.style;

    //初期化時
    upl.addListener("contentReady", function() {
        //複数選択可否の設定
        upl.setAllowMultipleFiles(self.maxCount > 1);
        //ファイル選択フィルターの設定
        var text = self.filterText + " (*." + self.filterExtensions.join(", *.") + ")";
        var ext = "*." + self.filterExtensions.join(";*.");
        upl.setFileFilters([{description: text, extensions: ext}]);
    });
    
    //ファイル選択時
    upl.addListener("fileSelect", function(ev) {
        self.totalSize = 0;
        var cnt = 0;
        var err = "";
        for (var fileId in ev.fileList) {
            cnt++;
            var size = ev.fileList[fileId].size;
            if (size / (1024 * 1024) > self.maxSize) {
                err = "アップロードできるファイルサイズは、1ファイルあたり ";
                err += self.maxSize + "MB までです。";
                break;
            }
            //プログレスバーのための準備
            ev.fileList[fileId].bytesLoaded = 0;
            self.totalSize += size;
        }
        if (cnt > self.maxCount) {
            err = "アップロードできるファイル数は " + self.maxCount + " ファイルまでです。";
        }
        if (err) {
            alert(err);
            upl.clearFileList();
            return;
        }

        //プログレスバー表示
        bar.style.width = "0%";
        pBar.box.style.display = "block";
        
        self.fileList = ev.fileList;
        self.completeFlg = false;
        self.onStart(ev.fileList);

        bodyStyle.cursor = self.cursor;

        upl.uploadAll(uploadUrl, "POST", self.postVars, self.postKey);
    });

    //アップロード進行時
    upl.addListener("uploadProgress", function(ev) {
        self.letProgress(ev.id, ev.bytesLoaded, bar);
    });

    //アップロード完了時
    upl.addListener("uploadComplete", function(ev) {
        self.letProgress(ev.id, self.fileList[ev.id].size, bar);
        bodyStyle.cursor = "auto";
        //コールバック
        self.onComplete(ev.id);
        if (bar.style.width == "100%" && !self.completeFlg) {
            self.completeFlg = true;
            self.onCompleteAll();
            upl.clearFileList();
        }
    });

    //アップロードエラー時（1度のエラーで2回呼ばれる）
    upl.addListener("uploadError", function(ev) {
        bodyStyle.cursor = "auto";
        if (isNaN(ev.status)) {    //2回目はエラー内容が渡される
            self.onError(ev.id, self.httpStatus, ev.status);
        } else {    //1回目はhttp statusが渡される
            self.httpStatus = ev.status;
        }
    });
};
/**
 *  アップローダー生成
 */
YahhoUpl.prototype.getYUIUploader = function(buttonId, btnImgUrl) {
    //YUI Uploader生成
    var yuiBase = this.YUI_URL.SERVER + this.YUI_URL.VERSION + this.YUI_URL.DIR;
    YAHOO.widget.Uploader.SWFURL = yuiBase + "uploader/assets/uploader.swf";
    return new YAHOO.widget.Uploader(buttonId, btnImgUrl);
};
/**
 *  プログレスバー生成
 */
YahhoUpl.prototype.getProgressBar = function(barId) {
    var box = document.getElementById(barId);
    box.style.display = "none";
    for (var style in this.progressBarStyle.box) {
        box.style[style] = this.progressBarStyle.box[style];
    }
    var bar = document.createElement("div");
    for (style in this.progressBarStyle.bar) {
        bar.style[style] = this.progressBarStyle.bar[style];
    }
    box.appendChild(bar);
    return {box: box, bar: bar};
};
/**
 *  プログレスバーを進める
 */
YahhoUpl.prototype.letProgress = function(eventId, amount, bar) {
    var list = this.fileList;
    list[eventId].bytesLoaded = amount;
    var loaded = 0;
    for (var fileId in list) {
        loaded += list[fileId].bytesLoaded;
    }
    bar.style.width = (loaded / this.totalSize) * 100 + "%";
};
/**
 *  必要なYUIのファイルを読み込む
 *  @param  Function    callback    読み込み完了後に実行するコールバック関数
 *  @see http://developer.yahoo.com/yui/yuiloader/
 */
YahhoUpl.loadYUI = function(callback) {
    var upl = new YahhoUpl();
    var yuiBase = upl.YUI_URL.SERVER + upl.YUI_URL.VERSION + upl.YUI_URL.DIR;

    //YUI Loaderをload
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = yuiBase + "yuiloader-dom-event/yuiloader-dom-event.js";
    document.getElementsByTagName("head")[0].appendChild(script);

    //YUI Loaderがloadされるまで待つ
    var limit = 3000, interval = 50, time = 0;
    var loadedId = setInterval(function(){
        if (window.YAHOO) {
            clearInterval(loadedId);
            //YUI Uploaderをload
            (new YAHOO.util.YUILoader({
                base: yuiBase, require: ["uploader"], onSuccess: callback
            })).insert();
        } else if ((time += interval) > limit) {    //タイムアウト
            alert("ファイルアップロード機能の読み込みに失敗しました。");
            clearInterval(loadedId);
        }
    }, interval);
};

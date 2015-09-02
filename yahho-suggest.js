/**
 *  Yahho Suggest
 *  @see       http://0-oo.net/sbox/javascript/yahho-suggest
 *  @version   0.1.2 beta 1
 *  @copyright 2010-2012 dgbadmin@gmail.com
 *  @license   http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 *
 *  See also
 *  @see http://developer.yahoo.com/yui/autocomplete/
 */

var YahhoSuggest = {
    /**
     *  loadYUI()で読み込むYUIのURL
     *  @see http://developer.yahoo.com/yui/articles/hosting/
     *  @see http://code.google.com/intl/en/apis/libraries/devguide.html#yui
     */
    YUI_URL: {
        SERVER: location.protocol + "//ajax.googleapis.com/ajax/libs/yui/",
        VERSION: "2.9.0",
        DIR: "/build/"
    },
    /** setUp前のテキストボックスのIDと候補として表示するデータの組合せ */
    _data: {},
    /** テキストボックスごとのYUI AutoCompleteのインスタンス */
    _autoCompletes: {},
    /** setUp済みかどうか */
    _readyFlg: false
};
/**
 *  準備する
 */
YahhoSuggest.setUp = function() {
    //YUIサンプル用CSSを適用させる
    YAHOO.util.Dom.addClass(document.body, "yui-skin-sam");
    
    var data = YahhoSuggest._data;
    for (var id in data) {
        YahhoSuggest._attach(id, data[id]);
    }
    YahhoSuggest._readyFlg = true;
};
/**
 *  候補を表示したいテキストボックスとデータを登録する
 *  @params String  textBoxId   テキストボックスのid属性
 *  @params Array   arr         候補の配列
 */
YahhoSuggest.set = function(textBoxId, arr) {
    if (YahhoSuggest._readyFlg) {
        var ac = YahhoSuggest._autoCompletes[textBoxId];
        if (ac) {
            ac.destroy();
        }
        YahhoSuggest._attach(textBoxId, arr);
    } else {
        YahhoSuggest._data[textBoxId] = arr;
    }
};
/**
 *  YUI AutoCompleteをセットする
 */
YahhoSuggest._attach = function(id, arr) {
    YahhoSuggest._autoCompletes[id] = new YAHOO.widget.AutoComplete(
        id,
        YAHOO.util.Dom.insertAfter(document.createElement("div"), id),
        new YAHOO.util.LocalDataSource(arr),
        { useShadow: true } //候補欄に影を付ける
    );
};
/**
 *  必要なYUIのJavaScriptとCSSを読み込む
 *  @param  String  yuiBase (optional) YUIのベースとなるURL
 *  @see http://developer.yahoo.com/yui/yuiloader/
 */
YahhoSuggest.loadYUI = function(yuiBase) {
    if (!yuiBase) {
        yuiBase = this.YUI_URL.SERVER + this.YUI_URL.VERSION + this.YUI_URL.DIR;
    }

    //YUI Loaderをload
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = yuiBase + "yuiloader-dom-event/yuiloader-dom-event.js";
    document.getElementsByTagName("head")[0].appendChild(script);

    //YUI Loaderがloadされるまで待つ
    var limit = 5000, interval = 50, time = 0;
    var loadedId = setInterval(function(){
        if (window.YAHOO) {
            clearInterval(loadedId);
            //YUIの必要なファイルをload
            (new YAHOO.util.YUILoader({
                base: yuiBase,
                require: ["animation", "autocomplete", "datasource"],
                onSuccess: YahhoSuggest.setUp
            })).insert();
        } else if ((time += interval) > limit) {    //タイムアウト
            clearInterval(loadedId);
        }
    }, interval);
};

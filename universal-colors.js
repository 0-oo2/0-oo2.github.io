/**
 *  Univeral Colors
 *  @see       http://0-oo.net/sbox/javascript/universal-colors
 *  @version   0.1.1
 *  @copyright 2010-2011 dgbadmin@gmail.com
 *  @license   http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 *
 *  Also see
 *  @see http://jfly.iam.u-tokyo.ac.jp/colorset/
 */
var UniversalColors = {
    /** 基本色 **/
    colors: {
        "赤":           [255,  51,   0],
        "青":           [  0,  65, 255],
        "緑":           [ 51, 153, 102],
        "黄色":         [255, 255,   0],
        "オレンジ":     [255, 153,   0],
        "紫":           [153,   0, 102],
        "茶色":         [102,  51,   0],
        "グレー":       [114, 132, 144],
        "黒":           [  0,   0,   0]
    },
    /** 明るい色 */
    lightColors: {
        "ピンク":       [255, 153, 153],
        "空色":         [102, 204, 255],
        "ベージュ":     [235, 190, 140],
        "クリーム色":   [255, 255, 153],
        "明るいピンク": [255, 211, 204],
        "明るい空色":   [180, 235, 250],
        "明るい緑":     [118, 228, 166],
        "明るい黄緑":   [203, 242, 102],
        "明るい紫":     [195, 180, 220],
        "明るいグレー": [204, 204, 204],
        "白":           [255, 255, 255]
    },
    /**
     *  明るい色も加える
     */
    addLightColors: function() {
        for (var name in this.lightColors) {
            this.colors[name] = this.lightColors[name];
        }
    },
    /**
     *  全ての色を16進表記（"#xxxxxx"）で返す
     *  @return Object  keyが色名、valueが16進表記の色データ
     */
    getHexColors: function() {
        var hexes = {};
        for (var name in this.colors) {
            var hex = "#";
            for (var i = 0, rgb = this.colors[name]; i < rgb.length; i++) {
                hex += ("0" + rgb[i].toString(16)).slice(-2);
            }
            hexes[name] = hex;
        }
        return hexes;
    },
    /**
     *  全ての色の16進表記をalert()で表示する
     */
    showHexColors: function() {
        var hexes = this.getHexColors();
        var s = "";
        for (var name in hexes) {
            s += name + ": " + hexes[name] + "\n";
        }
        alert(s);
    },
    /**
     *  背景色に応じて見やすい文字色（黒か白）を返す
     *  @param  String  backgroundColor（"#xxxxxx"形式）
     *  @return String  文字色（"#xxxxxx"形式）
     */
    getTextColor: function(backgroundColor) {
        var thickness = 0;
        for (var i = 1; i < backgroundColor.length; i += 2) {
            thickness += parseInt("0x" + backgroundColor.substr(i, 2));
        }
        if (thickness < 382.5) {    //平均より濃いかどうか
            return "#ffffff";
        } else {
            return "#000000";
        }
    }
};

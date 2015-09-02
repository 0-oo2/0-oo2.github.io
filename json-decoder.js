/**
 *  JSONDecoder.js
 *  @see       http://0-oo.net/sbox/javascript/json-decoder
 *  @version   0.1.2
 *  @copyright 2008-2011 dgbadmin@gmail.com
 *  @license   http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 */
var JSONDecoder = {};

/**
 *    typeofの拡張
 *    ArrayとかRegExpとかnullとかも判別する
 */
JSONDecoder.typeOf = function(value) {
    var type = typeof value;
    switch (type) {
        case "object":
            if (value instanceof Array) {
                type = "array";
            } else if (!(value instanceof Object)) {
                type = "null";
            }
            //no break
        case "function":
            if (value instanceof RegExp) {
                type = "regexp";
            }
            break;
    }
    return type;
};
/**
 *    JSONをFirebugのコンソールに書き出す
 */
JSONDecoder.toConsole = function(json) {
    JSONDecoder.out = function(line) { console.log(line); };
    JSONDecoder.decode("", json, "");
};
/**
 *    JSONをWebページ上に書き出す
 */
JSONDecoder.write = function(json) {
    document.write("<pre>" + JSONDecoder.toString(json) + "</pre>");
};
/**
 *    JSONをalertダイアログで表示する
 */
JSONDecoder.alert = function(json) {
    alert(JSONDecoder.toString(json));
};
/**
 *    JSONを見やすい文字列に変換する
 */
JSONDecoder.toString = function(json) {
    var decoded = "";
    JSONDecoder.out = function(line) { decoded += (line + "\n"); };
    JSONDecoder.decode("", json, "");
    return decoded;
};
/**
 *    JSONを解析する
 */
JSONDecoder.decode = function(index, value, indent) {
    var type = JSONDecoder.typeOf(value);
    var pack = undefined;

    switch (type) {    //型別に見やすくする
        case "object" :
            pack = ["{", "}"];
            break;
        case "array" :
            pack = ["[", "]"];
            break;
        case "function" :
            type = "";
            //no break
        case "string" :
            value = value.toString().replace(/\n/g, "\n" + indent);    //全体をインデント
            break;
        case "undefined" :
            type = "";
            value = "undefined";
            break;
        case "null" :
            type = "";
            value = "null";
            break;
    }

    if (type) {
        type = " (" + type + ")";    //整形
    }

    if (pack) {    //子要素がある場合は再帰処理
        JSONDecoder.out(indent + index + type + pack[0]);
        for (var i in value) {
            JSONDecoder.decode(i, value[i], indent + "\t");
        }
        JSONDecoder.out(indent + pack[1]);
    } else {
        JSONDecoder.out(indent + index + type + ": " + value);
    }
};
/**
 *    文字列をObjectに変換する
 */
JSONDecoder.str2json = function(str) {
    try {
        eval("var json = " + str + ";");
        return json;
    } catch (e) {
        return false;
    }
};

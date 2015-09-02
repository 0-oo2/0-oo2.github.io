/**
 *  GAddress Finder - Google日本語入力APIを使って、郵便番号から住所を検索
 *  @see       http://0-oo.net/sbox/javascript/gaddress-finder
 *  @version   0.2.0
 *  @copyright 2011-2013 dgbadmin@gmail.com
 *  @license   http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 *
 *  See also
 *  @see http://www.google.com/intl/ja/ime/cgiapi.html
 */
var GAddressFinder = {};
/**
 *  郵便番号から住所を検索する
 *  callbackに引数で渡されるのは [<住所>, <都道府県>, <都道府県以外の住所>] の配列
 *  @param	String	zip	郵便番号（フォーマットは"000-0000" or "0000000"）
 *  @param	Function	callback	検索結果を渡す関数
 *  @return	String	検索実行時は半角にしてハイフンを入れた郵便番号、そうでなければnull
 */
GAddressFinder.call = function(zip, callback) {
	if (zip) {
		zip = this._toHan(zip);	//全角の場合は半角にする
	}
	
	var matches = zip.match(/^(\d{3})(\d{4})$/);
	
	if (matches) {	//ハイフンが無い場合は入れる
		zip = matches[1] + "-" + matches[2];
	}
	
	if (!zip.match(/^\d{3}-\d{4}$/)) {
		return null;
	}
	
	this._userCallback = callback;
	
	var url = "//www.google.com/transliterate";	//httpsにも対応
	url += "?langpair=ja-Hira|ja&jsonp=GAddressFinder.callback&text=" + zip;
	
	var script = document.createElement("script");
	script.src = url;
	script.type = "text/javascript";
	document.body.appendChild(script);
	
	return zip;
};
/**
 *  郵便番号から検索した住所を入力欄にセットする
 *  @param	String	zipId	郵便番号を入力する要素のid属性
 *  @param	String	prefId	住所をセットする要素のid属性
 *  @param	String	otherId	(optional) 都道府県とその他を分ける場合のその他のid属性
 *  @return	Boolean	検索を実行したかどうか
 */
GAddressFinder.set = function(zipId, prefId, otherId) {
	var zip = document.getElementById(zipId);
	
	var result = this.call(zip.value, function(address) {
		if (!address) {
			alert("該当する住所がありませんでした");
			return;
		}
		
		var elm = document.getElementById(prefId);	//住所欄 or 都道府県欄
		
		if (!otherId) {	//テキストボックス1つの場合
			elm.value = address[0];
			return;
		}
		
		if (elm.tagName == "INPUT") {
			elm.value = address[1];
		} else {
			for (var i = 0, len = elm.length; i < len; i++) {
				if (elm.options[i].text == address[1]) {
					elm.options[i].selected = true;
					break;
				}
			}
		}
		
		document.getElementById(otherId).value = address[2];
	});
	
	if (result) {
		zip.value = result;
		return true;
	} else {
		alert("正しい郵便番号を入力してください");
		return false;
	}
};
/**
 *  Google日本語入力APIからJSONPで呼ばれる
 *  @param	Array	results	検索結果
 */
GAddressFinder.callback = function(results) {
	this._userCallback(results[0][1][0].match(/^(.{2,3}?(?:都|道|府|県))(.*)$/));
};
/**
 *  半角に変換
 *  @param	String	before
 *  @retrun	String
 */
GAddressFinder._toHan = function(before) {
	var zen = "０１２３４５６７８９－ー";	//長音符号も変換してあげる
	var han = "0123456789--";
	var after = "";
	
	for (var i = 0, len = before.length; i < len; i++) {
		var c = before.charAt(i);
		after += han.charAt(zen.indexOf(c)) || c;
	}
	
	return after;
};

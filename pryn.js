/**
 *  Pryn.js
 *  @see        http://0-oo.net/sbox/javascript/pryn-js-css
 *  @version    1.1.0 beta 2
 *  @copyright  2007-2012 dgbadmin@gmail.com
 *  @license    http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 *
 *  連携するCSSクラス
 *  (input, textarea).ready     ページ表示時に入力待機状態にする要素。autofocus属性でも可
 *  (input, textarea).focused   入力中の要素
 *  (input, textarea).hint      ヒント付テキストボックス。placeholder属性でも可
 *                              placeholder属性を使わない場合、ヒントはtitle属性にセット
 *  (input, textarea).copy      コピー用テキストボックス
 *  table.stripes               シマシマにしたい表
 *  tr.stripe                   シマシマにされた行
 *  .wait                       別のページへの遷移中に表示が変わる要素
 */


/***** 組み込みオブジェクトの拡張 *****/

/**
 *  文字列のtrim
 *  @return	String	trim後の文字列
 */
String.prototype.trim = function() {
	return this.replace(/(^\s+|\s+$)/g, "");
};
/**
 *  子要素全てに関数の処理を実行する
 *  @param	Object	it	子要素をループ処理できるオブジェクト
 */
Function.prototype.foreach = function(it) {
	for (var i = 0, len = it.length; i < len; i++) {
		this(it[i]);
	}
};
Function.prototype.foreach.foreach = null;	//再帰を防ぐ


/***** グローバル関数/オブジェクト *****/

/**
 *  Firebugが無い場合はconsole.log()を空振りさせる
 */
if (!window.console) {
	window.console = { log: function(s){}, dummy: true };
}
/**
 *  html要素をidで取得する（既に$()があればそちらを使う）
 *  @param	String	id
 *  @retrun	HTMLElement	html要素
 */
if (!window.$) {
	window.$ = function(id) { return document.getElementById(id); };
}
/**
 *  html要素をタグ名で取得する
 *  @param	String	tagName
 *  @retrun	NodeList
 */
function $T(tagName) {
	return document.getElementsByTagName(tagName);
}


/***** Pryn *****/

var Pryn = {};

/**
 *  イベントを追加する
 *  @param	HTMLElement	elm
 *  @param	String	eventName
 *  @param	Function	fnc
 */
Pryn.addEvent = (function() {
	if (window.addEventListener) {
		return function(elm, eventName, fnc) {
			if (elm == window && eventName == "load") {
				document.addEventListener("DOMContentLoaded", fnc, false);
			} else {
				elm.addEventListener(eventName, fnc, false);
			}
		};
	}

	return function(elm, eventName, fnc) {
		//IE8-でもfunction内でthisで自分（elm）を参照できるようにする
		elm.attachEvent("on" + eventName, function() { fnc.call(elm); });
	};
})();
/**
 *  選択リストで選択された選択肢を取得する
 *  @param	String	id	選択リストのid
 *  @return	HTMLElement	選択された選択肢（option要素）
 */
Pryn.getSelected = function(id) {
	var selector = document.getElementById(id);
	return selector.options[selector.selectedIndex];
};


/***** Pryn.ClassAccessor *****/

/**
 *  html要素のclass属性へのアクセサクラス
 *  @param	HTMLElement	elm
 */
Pryn.ClassAccessor = function(elm) {
	/**
	 *  html要素のclassを変更する
	 *  @param	String	oldClass
	 *  @param	String	newClass
	 */
	this.convertClass = function(oldClass, newClass) {
		this.removeClass(oldClass);
		this.addClass(newClass);
	};

	//classListに対応していればclassListを使う (Firefox, Chrome)
	if (Pryn.Init._classListable) {
		this.hasClass = function(className) { return elm.classList.contains(className); };
		this.addClass = function(className) { elm.classList.add(className); };
		this.removeClass = function(className) { elm.classList.remove(className); };
		return;
	}

	/**
	 *  html要素にclassがあるか確かめる
	 *  @param	String	className
	 *  @return	Mixed	あればArray、なければnullまたは""
	 */
	this.hasClass = function(className) {
		var cn = elm.className;
		return (cn && cn.match(this._toRegExp(className)));
	};
	/**
	 *  html要素にclassを追加する
	 *  @param	String	className
	 */
	this.addClass = function(className) {
		if (!this.hasClass(className)) {
			elm.className += " " + className;
		}
	};
	/**
	 *  html要素からclassを削除する
	 *  @param	String	className
	 */
	this.removeClass = function(className) {
		elm.className = elm.className.replace(this._toRegExp(className), " ");
	};
	/**
	 *  class名を表す正規表現を取得する
	 *  @param	String	className
	 *  @return	RegExp
	 */
	this._toRegExp = function(className) {
		return new RegExp("(^|\\s)" + className + "(\\s|$)", "ig");
	};
};


/***** Pryn.Init *****/

/**
 *  ページ表示時の初期処理
 */
Pryn.Init = {
	/** ページ遷移時のform凍結・表示変更を解除するまでの時間（秒） */
	frozenTime: 10,
	/** ページ遷移時の表示変更の対象 */
	_waitables: [],

	/** ブラウザがHTML5のautofocus属性に対応しているかどうか */
	_autoFocusable: "autofocus" in document.createElement("textarea"),

	/** ブラウザがHTML5のplaceholder属性に対応しているかどうか */
	_placeHoldable: "placeholder" in document.createElement("textarea"),

	/** ブラウザがHTML5のclassListに対応しているかどうか */
	_classListable: "classList" in document.createElement("div"),
	
	/** IE7-かどうか */
	_ltIE7: false
};

/**
 *  表をシマシマにする（奇数番目のtr要素のclassに stripe を追加する）
 *  シマシマにしたくない行（見出し行など）はthead要素で囲っておくこと
 *  @param	HTMLElement	table	table要素
 */
Pryn.Init._stripeTable = function(table) {
	if (!(new Pryn.ClassAccessor(table)).hasClass("stripes")) {
		return;
	}

	var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

	for (var i = 0, len = rows.length; i < len; i += 2) {
		(new Pryn.ClassAccessor(rows[i])).addClass("stripe");
	}
};
/**
 *  formの子要素のstyle等の設定
 *  @param	HTMLElement	elm	input要素 or textarea要素
 */
Pryn.Init._setFormStyle = function(elm) {
	var acs = new Pryn.ClassAccessor(elm);

	if (elm.tagName == "TEXTAREA") {
		Pryn.Init._setTextStyle(elm, acs);
	} else if (elm.tagName == "INPUT" && !elm.getAttribute("type")) {
		elm.type = "text";	//FirefoxとOperaはセットしないとtextと認識しない
	}

	switch (elm.type) {
		case "text":
		case "search":
		case "password":
			Pryn.Init._setTextStyle(elm, acs);
			break;
		case "submit":
			elm.value = elm.value || "送信";	//IE:非対応
			break;
		case "image":
			Pryn.Init._setSmartImage(elm);
			//imageボタンはformの子要素にならないのでここでセット
			Pryn.Init._waitables.push(elm);
			break;
	}

	//画面表示時にfocusを当てる
	if (acs.hasClass("ready")) {
		elm.focus();
	} else if (!Pryn.Init._autoFocusable && elm.getAttribute("autofocus") !== null) {
		elm.focus();
	}
};
/**
 *  テキスト入力系要素のstyle等の設定
 *  @param	HTMLElement	elm	formの子要素
 *  @param	Pryn.ClassAccessor	acs
 */
Pryn.Init._setTextStyle = function(elm, acs) {
	Pryn.Init._setPlaceHolder(elm, acs);

	Pryn.addEvent(elm, "focus", function() {
		if (!elm.readOnly) {
			acs.addClass("focused");
		}
	});

	Pryn.addEvent(elm, "blur", function() { acs.removeClass("focused"); });

	if (acs.hasClass("hint")) {	//ヒント付テキストボックス
		if (elm.value) {	//初期状態で値がある場合
			acs.removeClass("hint");
		} else {
			elm.value = elm.getAttribute("placeholder");
		}

		Pryn.addEvent(elm, "focus", function() {
			if (acs.hasClass("hint")) {	 //ヒント表示中の場合
				acs.removeClass("hint");
				elm.value = "";
			}
		});

		Pryn.addEvent(elm, "blur", function() {
			if (!elm.value) {	//未入力の場合
				acs.addClass("hint");
				elm.value = elm.getAttribute("placeholder");
			}
		});
	} else if (acs.hasClass("copy")) {	//コピー用テキストボックス
		elm.readOnly = true;

		Pryn.addEvent(elm, "focus", function() {
			setTimeout(function() { elm.select(); }, 100);	//selectし損ねるのを防ぐ
		});
	}
};
/**
 *  テキスト入力系要素のplaceholderの設定
 *  @param	HTMLElement	elm	formの子要素
 *  @param	Pryn.ClassAccessor	acs
 */
Pryn.Init._setPlaceHolder = function(elm, acs) {
	var placeHolder = elm.getAttribute("placeholder");

	if (placeHolder) {
		if (!Pryn.Init._placeHoldable) {
			acs.addClass("hint");	//擬似placeholder表示
		}

		if (!elm.title) {
			elm.title = placeHolder;	//title属性にもセット
		}
	} else if (acs.hasClass("hint")) {
		elm.setAttribute("placeholder", elm.title);
	}

	if (Pryn.Init._placeHoldable) {
		acs.removeClass("hint");
	}
};
/**
 *  別ページへの遷移時のマウスカーソル変更とformの凍結
 *  @param	HTMLElement	link	a要素
 */
Pryn.Init._setSmartLink = function(link) {
	if (Pryn.Init._setTarget(link)) {
		Pryn.Init._waitables.push(link);
	}
};
/**
 *  form送信時の処理
 *  @param	HTMLElement	frm	form要素
 */
Pryn.Init._setSmartSubmit = function(frm) {
	if (!Pryn.Init._placeHoldable) {
		Pryn.addEvent(frm, "submit", function() {
			(function(elm) {
				//form送信前にヒントをクリア
				if ((new Pryn.ClassAccessor(elm)).hasClass("hint")) {
					elm.value = "";
				}
			}).foreach(frm);
		});
	}

	if (Pryn.Init._setTarget(frm)) {
		(function(child) { Pryn.Init._waitables.push(child); }).foreach(frm);
	}
};
/**
 *  別ドメインへの遷移は別Windowで開く
 *  @param	HTMLElement	elm	a要素 or form要素
 *  @return	boolean	同一ドメインかどうか
 */
Pryn.Init._setTarget = function(elm) {
	var url = (elm.href || elm.action || "");

	if (url.match(/^https?:/i) && url.split("/")[2] != location.hostname) {
		elm.target = "_blank";
		return false;
	} else {
		return true;
	}
};
/**
 *  label要素のクロスブラウザ対応（Safari2以前は非対応）
 *  @param	HTMLElement	label
 */
Pryn.Init._setSmartLabel = function(label) {
	var input = null;

	if (label.htmlFor) {
		input = document.getElementById(label.htmlFor);
	} else {
		input = label.getElementsByTagName("INPUT")[0];
	}

	if (!input) {
		return;
	}

	if (input.title && !label.title) {
		label.title = input.title;	//label要素にも同じtitle属性を付ける
	}

	//IEはlabel要素内のimg要素をクリックしてもチェックが付かない
	var images = label.getElementsByTagName("IMG");
	var len = images.length;

	if (!len) {
		return;
	}

	var clickIt = function() { input.click(); };

	for (var i = 0; i < len; i++) {
		Pryn.addEvent(images[i], "click", clickIt);
	}
};
/**
 *  画像系要素のtitleの設定
 *  @param	HTMLElement	img
 */
Pryn.Init._setSmartImage = function(img) {
	if (!img.title && img.alt) {
		img.title = img.alt;	//title属性をセット（IEの動きに合わせる）
	}
};
/**
 *  別ページへの遷移時のマウスカーソル変更とformの二重送信防止の解除
 */
Pryn.Init.unfreeze = function() {
	(function(elm) {
		var acs = new Pryn.ClassAccessor(elm);

		if (acs.hasClass("wait")) {
			elm.disabled = false;
			acs.removeClass("wait");
		}
	}).foreach(Pryn.Init._waitables);
};


/**
 *  初期処理（見た目の影響のあるものを優先）
 */
Pryn.addEvent(window, "load", function() {
	//IE7-かどうかの判定（@_jscript_versionと違い、IE7互換モードも判定可能）
	var div = document.createElement("div");
	div.innerHTML = "<!--[if lt IE 8]>.<![endif]-->";
	Pryn.Init._ltIE7 = !!div.innerText;

	Pryn.Init._stripeTable.foreach($T("table"));

	Pryn.Init._setFormStyle.foreach($T("input"));
	Pryn.Init._setFormStyle.foreach($T("textarea"));

	Pryn.Init._setSmartLink.foreach($T("a"));
	Pryn.Init._setSmartSubmit.foreach($T("form"));
	Pryn.Init._waitables.push(document.body);

	Pryn.Init._setSmartLabel.foreach($T("label"));

	Pryn.Init._setSmartImage.foreach($T("img"));
	Pryn.Init._setSmartImage.foreach($T("area"));

	document.body.spellcheck = false;	//スペルチェックなし（Safari:非対応）
});
/**
 *  別ページへの遷移時のマウスカーソル変更とformの二重送信防止
 */
Pryn.addEvent(window, "beforeunload", function() {
	(function(elm) {
		if (!elm.disabled) {
			(new Pryn.ClassAccessor(elm)).addClass("wait");

			if (elm.tagName != "A" && elm.tagName != "BODY") {
				elm.disabled = true;	//formの子要素は使用不可にする
			}
		}
	}).foreach(Pryn.Init._waitables);

	//一定時間経ったら元に戻す
	setTimeout(Pryn.Init.unfreeze, Pryn.Init.frozenTime * 1000);
});
/**
 *  別ページへの遷移時のマウスカーソル変更とformの二重送信防止の解除
 */
Pryn.addEvent(window, "unload", Pryn.Init.unfreeze);

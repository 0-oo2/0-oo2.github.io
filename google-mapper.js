/**
 *  GoogleMapper.js - (The Wrapper Class of Google Maps API V2)
 *  @see       http://0-oo.net/sbox/javascript/google-mapper
 *  @version   0.2.1a
 *  @copyright 2008-2010 dgbadmin@gmail.com
 *  @license   http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 *
 *  See also Google Maps API documents.
 *  @see http://code.google.com/intl/en/apis/maps/documentation/reference.html
 */
var GoogleMapper = {
    /**
     *  マーカーを表示する位置情報
     *  （例）
     *  GoogleMapper.points = [
     *      {lat: 35.7, lng: 139.7, title: "Tokyo", openFlg: true},
     *      {lat: 35.2, lng: 136.9, title: "Nagoya"},
     *      {lat: 34.7, lng: 135.5, title: "Osaka"}
     *  ];
     *  ・lat, lngは必須
     *  ・titleはMarkerにマウスカーソルを当てたときに表示される
     *  ・openFlg = true の場合、地図の初期表示時に吹き出しが表示される
     *  ・iconにGIconをセットすると個別のiconを表示できる
     *  ・その他に getInfoHtml() で使いたいデータを入れてもOK
     */
    points: [],
    
    /**
     *  地図をクリックされた時に情報Windowを表示するかどうか
     *  trueにすると、副作用としてダブルクリックによるズームを無効にする
     */
    pointable: false,
    
    /**
     *  検索結果に表示されるAdSenseの設定
     *  （例）
     *  GoogleMapper.barAdsOptions = {
     *      client: "partner-pub-xxxxxxxxxxxxxxxx",
     *      channel: "xxxxxxxxxx"
     *  };
     */
    barAdsOptions: {},
    
    /** loadしたGMap2オブジェクトがセットされる */
    map: null,
    
    /** サイトごとのカスタマイズをするための関数群 */
    custom: {}
};
/**
 *  @param   String  mapId   地図表示に使う要素（div等）のid属性
 *  @param   Float   lat     初期表示する中心地点の緯度
 *  @param   Float   lng     初期表示する中心地点の経度
 *  @param   Integer zoom    初期表示するズーム値
 *  @param   Object  loadOptions （省略可）Google Mapsをload時のオプション
 */
GoogleMapper.load = function(mapId, lat, lng, zoom, loadOptions) {
    // @see http://code.google.com/intl/ja/apis/ajax/documentation/#GoogleLoad
    google.load("maps", "2", loadOptions);
    
    google.setOnLoadCallback(function() {
        //IEのメモリリーク対策
        // @see http://code.google.com/intl/ja/apis/maps/documentation/javascript/v2/basics.html#Memory_Leaks
        document.getElementsByTagName("body")[0].onunload = GUnload;
        
        //ブラウザが対応しているかチェック
        if (!GBrowserIsCompatible()) {
            GoogleMapper.custom.onUnavailable();
            return;
        }
        
        var map = (GoogleMapper.map = new GMap2(document.getElementById(mapId), {
            googleBarOptions: {
                style: "new",   //新バージョンの検索窓
                adsOptions: GoogleMapper.barAdsOptions
            }
        }));
       
        GoogleMapper.setupMap(map);
        
        GoogleMapper.custom.initCallback();
        
        //地図を表示
        map.setCenter(new GLatLng(lat, lng), zoom);
        
        //マーカーを表示
        var icon = GoogleMapper.custom.getIcon();
        for (var i = 0; i < GoogleMapper.points.length; i++) {
            GoogleMapper.addMarker(GoogleMapper.points[i], icon);
        }
    });
};
/**
 *  地図の表示設定をする
 *  @param  GMap2   map
 */
GoogleMapper.setupMap = function(map) {
    var ui = map.getDefaultUI();
    
    if (ui.controls.scalecontrol) { //largeの場合のみtrueになっている
        ui.controls.scalecontrol = false;           //縮尺
        map.enableGoogleBar();                      //統合検索コントロール
        map.addControl(new GOverviewMapControl());  //概観地図
    }
    
    if (GoogleMapper.pointable) {
        ui.zoom.doubleclick = false;    //ダブルクリックによるズーム
        
        //地図をクリックされた時のイベント
        GEvent.addListener(map, "click", function(overlay, latlng) {
            if (latlng) {   //Windowを閉じる時のクリックは無視
                map.openInfoWindowHtml(
                    latlng, GoogleMapper.custom.getClickInfoHtml(latlng)
                );
            }
        });
    }

    map.setUI(ui);
    map.enableContinuousZoom();     //滑らかなズームを有効にする
};
/**
 *  マーカーを追加する
 *  @param  Object  point
 *  @param  GIcon   defaultIcon
 *  @return GMarker
 */
GoogleMapper.addMarker = function(point, defaultIcon) {
    var option = { title: point.title, icon: point.icon || defaultIcon };
    
    var info = GoogleMapper.custom.getInfoHtml(point);
    if (!info) {
        option.clickable = false;
    }
    
    var marker = new GMarker(new GLatLng(point.lat, point.lng), option);
    GoogleMapper.map.addOverlay(marker);
    
    if (info) {
        //クリックされたら吹き出しを表示する
        GEvent.addListener(marker, "click", function(){ this.openInfoWindowHtml(info); });
        
        if (point.openFlg) {    //最初から吹き出しを表示する
            marker.openInfoWindowHtml(info);
        }
    }
    
    if (window["MarkerTracker"]) {
        //現在の表示範囲の外にあるマーカーが分かるようにする
        // @see http://gmaps-utility-library.googlecode.com/svn/trunk/markertracker/
        (new MarkerTracker(marker, GoogleMapper.map));
    }
    
    return marker;
};



/******************************************************************************
 *  以下はサイトに合わせて上書きする関数
 ******************************************************************************/

/**
 *  Google Mapsが使用できない環境の場合に呼ばれる
 */
GoogleMapper.custom.onUnavailable = function() {
    alert("このブラウザでは地図を表示できません");
};
/**
 *  マーカーの画像を返す
 */
GoogleMapper.custom.getIcon = function() {
    if (!window["MapIconMaker"]) {
        return G_DEFAULT_ICON;
    }
    // @see http://gmaps-utility-library.googlecode.com/svn/trunk/mapiconmaker/
    return MapIconMaker.createMarkerIcon({
        //Sample
        primaryColor: "#00FFFF", strokeColor: "#666666"
    });
};
/**
 *  マーカーに表示する吹き出しの中身のHTMLを作成して返す
 *  @param  Object  point   マーカー情報
 */
GoogleMapper.custom.getInfoHtml = function(point) {
    //Sample
    return point.title;
};
/**
 *  地図をクリックされた時に表示する吹き出しの中身のHTMLを作成して返す
 *  （GoogleMapper.pointable = true の場合のみ有効）
 *  @param  GLatlng     latlng  緯度経度
 */
GoogleMapper.custom.getClickInfoHtml = function(latlng) {
    //Sample
    var info = "緯度: " + latlng.lat() + "<br />経度: " + latlng.lng();
    info += "<br />ズーム: " + GoogleMapper.map.getZoom();
    return info;
};
/**
 *  初期表示時のコールバック関数
 */
GoogleMapper.custom.initCallback = function() { /* pass */ };

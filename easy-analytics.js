/**
 *  Easy Analytics
 *
 *  Usage: <script src="path/to/easy-analytics.js#UA-xxxxxxx-x"></script>
 *
 *  @see       http://0-oo.net/sbox/javascript/easy-analytics (Coming soon)
 *  @version   0.1.0 beta 4
 *  @copyright 2011 dgbadmin@gmail.com
 *  @license   http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 */

var _gaq = _gaq || [];

(function() {
	var MY_NAME = "easy-analytics.js";
	
	var id = null;
	var scripts = document.getElementsByTagName("script");
	
	for (var i = scripts.length - 1; i >= 0 ; i--) {
		var src = scripts[i].src;
		if (src.match(MY_NAME)) {
			id = src.split("#")[1];
			break;
		}
	}
	
	if (!id) {
		return;
	}
	
	_gaq.push(["_setAccount", id]);
	_gaq.push(["_trackPageLoadTime"]);
	
	if (window.$ && $.mobile) {	// Tracking for jQuery Mobile
		$('[data-role="page"]').live("pageshow", function() {
			var hash = location.hash;
			
			if (hash && hash.length > 1) {	// Not only "#"
				var url = hash.substr(1);
				
				if (url.charAt(0) != "/") {	// hash is the ID of the page
					url = location.pathname + hash;
				}
				
				_gaq.push(["_trackPageview", url]);
			} else {
				_gaq.push(["_trackPageview"]);
			}
		});
	} else {
		_gaq.push(["_trackPageview"]);
	}
	
	var ga = document.createElement("script");
	ga.type = "text/javascript";
	ga.async = true;
	ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
	
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(ga, s);
})();

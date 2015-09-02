/**
 *  jQuery Pryn Plugin
 *  @see        http://0-oo.net/sbox/javascript/jquery-pryn (Coming soon?)
 *  @version    0.1.0 beta 4
 *  @copyright  2011 dgbadmin@gmail.com
 *  @license    http://0-oo.net/pryn/MIT_license.txt (The MIT license)
 *
 *  Related CSS classes
 *   .placeholder   Text box with placeholder
 *   .wait          Waiting a next page
 */

(function($) {
	$.pryn = function(options) {
		options = $.extend({ "frozenTime": 10 }, options);
		
		$.pryn.autofocus(options);
		$.pryn.placeholder(options);
		$.pryn.external(options);
		$.pryn.wait(options);
		$.pryn.label(options);
		$.pryn.image(options);
		
		return $;
	};
	/**
	 *	Autofocus (HTML5 attributes)
	 */
	$.pryn.autofocus = function() {
		if (!("autofocus" in document.createElement("textarea"))) {
			$("[autofocus]").focus();
		}
	};
	/**
	 *	Placeholder (HTML5 attributes)
	 */
	$.pryn.placeholder = function() {
		// Text of placeholder also shown as tooltip
		$("[placeholder][!title]").each(function() {
			var elm = $(this);
			elm.attr("title", elm.attr("placeholder"));
		});
		
		if (("placeholder" in document.createElement("textarea"))) {
			return;
		}
		
		function setPlaceholder(dom) {
			var elm = $(dom);
			
			if (!elm.val()) {
				elm.addClass("placeholder").val(elm.attr("placeholder"));
			}
		}
		
		function removePlaceholder(dom) {
			var elm = $(dom);
			
			if (elm.hasClass("placeholder")) {
				elm.removeClass("placeholder").val("");
			}
		}
		
		var placeholders = $("[placeholder]");
		placeholders.each(function() { setPlaceholder(this); });
		placeholders.live("focus", function() { removePlaceholder(this); });
		placeholders.live("blur", function() { setPlaceholder(this); });
		
		$("form").submit(function() {
			$("[placeholder]").each(function() { removePlaceholder(this); });
		});
	};
	/**
	 *	External links and forms
	 */
	$.pryn.external = function() {
		$("a, form").not("[target]").each(function() {
			var elm = $(this);
			var url = elm.attr("href") || elm.attr("action") || "";
			
			if (url.match(/^https?:/i) && url.split("/")[2] != location.hostname) {
				elm.attr("target", "_blank");
			}
		});
	};
	/**
	 *	Waiting a next page
	 *	@param	Object	options	{ frozenTime: seconds_of_freezing_page }
	 */
	$.pryn.wait = function(options) {
		function unfreeze() {
			$("body, a, input, textarea, select").filter(".wait").each(function() {
				$(this).prop("disabled", false).removeClass("wait");
			});
		}
		
		$(window).bind("beforeunload", function() {
			$("body, a, input, textarea, select").each(function() {
				var elm = $(this);
				
				if (!elm.prop("disabled")) {
					elm.addClass("wait");
					elm.filter("input, textarea, select").prop("disabled", true);
				}
			});
			
			setTimeout(unfreeze, options.frozenTime * 1000);
		}).unload(unfreeze);
	};
	/**
	 *	Cross-browser labels
	 */
	$.pryn.label = function() {
		$("label").each(function() {
			var label = $(this);
			var input = null;
			
			if (label.attr("for")) {
				input = $("#" + label.attr("for"));
			} else {
				input = label.find("input");
			}
			
			if (!input) {
				return;
			}
			
			if (input.attr("title") && !label.attr("title")) {
				label.attr("title", input.attr("title"));
			}
			
			label.find("img").click(function() { input.click(); });	// for IE
		});
	};
	/**
	 *	Title attributes of images
	 */
	$.pryn.image = function() {
		$("img, area, :image").filter("[!title][alt]").each(function() {
			var img = $(this);
			img.attr("title", img.attr("alt"));	// Same as IE
		});
	};
})(jQuery);

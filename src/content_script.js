var dd = new DragonDrop({
	dragon: config.dragons['default'],
	flames: config.flames
});
DragonDrop.Colors = config.colors;
DragonDrop.DefaultColor = config.defaultColor;

// Here we set up our injection script. This handles intercepting events
// and then dealing with them back here.
var script = document.createElement('script');
script.src = chrome.extension.getURL('src/inject.js');
script.onload = function() {
	console.log('registering');

	// The way this all works is via custom events. The injected script
	// creates a hidden div that then fires custom events with a ton of
	// information. The extension listens for these and then does something
	// if it needs to!
	document.getElementById('dragondrop_events').addEventListener('DragonDropUpdate', function(event) {
		console.log("FIRING UPDATE FOR " + event.detail.eventName);

		// Activate DD if we actually have a valid event.
		if (!dd.active) {
			dd.active = true;
			dd.enable();
			chrome.extension.sendRequest({enabled: true});
		}

		var $element = $(event.detail.element);
		var farmland = dd.attachFarmland($(event.detail.element));
		// This is really important. Since DD depends on all kinds of crazy
		// shenanigans, we want to make sure the actual dragging and dropping
		// works as intended, which means being able to call the original
		// callback. Which somehow works. Cool.
		if (typeof event.detail.callback == "function") {
			farmland.addCallback(event.detail.eventName, event.detail.callback);
		}
	});
};


// Not sure why the fuck I need to inject this, but while testing on
// http://www.html5rocks.com/en/tutorials/dnd/basics/
// it appeared to not work unless I did??? I dunno.
var clipboard = document.createElement('script');
clipboard.src = chrome.extension.getURL('src/clipboard.js');


// Here we inject code that is going to run directly in the page and,
// technically, won't have direct content with the extension.
var html = document.querySelector('html');
html.appendChild(script);
html.appendChild(clipboard);

// This listens for the page action to be clicked and enables or disables
// the ability to explode everything on the page. The page action will only
// work if there's actually something draggable on the page.
chrome.extension.onRequest.addListener(function(request, sender, callback) {
	if (dd.active) {
		dd[(dd.enabled) ? 'disable' : 'enable']();
	}
	callback({enabled: dd.enabled});
});

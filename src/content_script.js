
var dd = new DragonDrop({
	dragon: config.dragons['default'],
	flames: config.flames
});
DragonDrop.Colors = config.colors;
DragonDrop.DefaultColor = config.defaultColor;

var script = document.createElement('script');
script.src = chrome.extension.getURL('src/inject.js');
script.onload = function() {
	console.log('registering');

	document.getElementById('dragondrop_events').addEventListener('DragonDropUpdate', function(event) {
		console.log("FIRING UPDATE FOR " + event.detail.eventName);

		// Activate the magic
		if (!dd.active) {
			dd.active = true;
			dd.enable();
			chrome.extension.sendRequest({enabled: true});
		}

		var $element = $(event.detail.element);
		var farmland = dd.attachFarmland($(event.detail.element));
		if (typeof event.detail.callback == "function") {
			farmland.addCallback(event.detail.eventName, event.detail.callback);
		}
	});
};


// Not sure why the fuck I need to inject this, but while testing on
// http://www.html5rocks.com/en/tutorials/dnd/basics/
// it appeared to not work unless I did??? I dunno
var clipboard = document.createElement('script');
clipboard.src = chrome.extension.getURL('src/clipboard.js');

var html = document.querySelector('html');
html.appendChild(script);
html.appendChild(clipboard);


chrome.extension.onRequest.addListener(function(request, sender, callback) {
	if (dd.active) {
		dd[(dd.enabled) ? 'disable' : 'enable']();
	}
	callback({enabled: dd.enabled});
});

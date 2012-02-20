
var dd = new DragonDrop({dragon: 'dragon.jpg'});

console.log("CONTENT SCRIPT");

var script = document.createElement('script');
script.src = chrome.extension.getURL('src/inject.js');
script.onload = function() {
	console.log('registering');

	document.getElementById('dragondrop_events').addEventListener('DragonDropUpdate', function(event) {
		console.log("FIRING UPDATE FOR " + event.detail.eventName);

		var $element = $(event.detail.element);
		var farmland = dd.attachFarmland($(event.detail.element));
		if (typeof event.detail.callback == "function") {
			farmland.addCallback(event.detail.eventName, event.detail.callback);
		}
	});
};
document.querySelector('html').appendChild(script);

console.log('what the what');

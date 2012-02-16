
var dd = new DragonDrop({dragon: 'dragon.jpg'});

console.log("CONTENT SCRIPT");

var script = document.createElement('script');
script.src = chrome.extension.getURL('src/inject.js');
script.onload = function() {
	console.log('registering');

	document.getElementById('dragondrop_events').addEventListener('DragonDropUpdate', function(event) {
		console.log("FIRING UPDATE");
		var elements = $('[dragondrop]');

		_.each(elements, function(element) {
			element = $(element);

			dd.attachFarmland(element, {
				is_draggable: !!element.attr('dragondrop-draggable'),
				is_droppable: !!element.attr('dragondrop-droppable')
			});
		});
	});
};
document.querySelector('html').appendChild(script);

console.log('what the what');

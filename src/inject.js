(function() {
	console.log('injectin');

	// Hidden element
	var dragondrop_el = document.createElement('div');
	dragondrop_el.id = 'dragondrop_events';
	dragondrop_el.style.display = 'none !important';
	document.querySelector('html').appendChild(dragondrop_el);

	var drag_events = ['dragstart', 'drag', 'dragenter', 'dragover', 'drop', 'drageend'];
	var drag_events_we_actually_care_about = ['dragstart', 'drop'];

	// Override the default addEventListener function so that we can intercept the
	// events we need. Note that this method doesn't seem to work in Firefox. But since
	// this is a Chrome extension, who gives a crap, right?
	Element.prototype.realAddEventListener = Element.prototype.addEventListener;
	Element.prototype.addEventListener = function(eventName, callback, useCapture) {
		// Override with DRAGON DROPPING TECHNOLOGY
		if (drag_events.indexOf(eventName) > -1) {
			if (drag_events_we_actually_care_about.indexOf(eventName) > -1) {

				this.setAttribute('dragondrop', true);
				switch (eventName) {
					case 'dragstart': this.setAttribute('dragondrop-draggable', true); break;
					case 'drop': this.setAttribute('dragondrop-droppable', true); break;
				}

				// Custom event
				var dragondrop_event = document.createEvent('Event');
				dragondrop_event.initEvent('DragonDropUpdate', false, false);
				dragondrop_el.dispatchEvent(dragondrop_event);
			}
			return;
		}

		this.realAddEventListener(eventName, callback, useCapture);
	}
})();

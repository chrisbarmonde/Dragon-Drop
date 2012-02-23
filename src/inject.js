(function() {
	console.log('injecting');

	// From underscore.js, modified a bit to not rely on it
	function dd_bind(func, context) {
		var bound, args, nativeBind = Function.prototype.bind;
		var slice = Array.prototype.slice, ctor = function(){};

		if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (typeof func != "function") throw new TypeError;
		args = slice.call(arguments, 2);
		return bound = function() {
			if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
			ctor.prototype = func.prototype;
			var self = new ctor;
			var result = func.apply(self, args.concat(slice.call(arguments)));
			if (Object(result) === result) return result;
			return self;
		};
	};

	// Hidden element
	var dragondrop_el = document.createElement('div');
	dragondrop_el.id = 'dragondrop_events';
	dragondrop_el.style.display = 'none !important';
	document.querySelector('html').appendChild(dragondrop_el);

	var drag_events = ['dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'drop', 'drageend'];
	var drag_events_we_actually_care_about = ['dragstart', 'drop'];

	// Override the default addEventListener function so that we can intercept the
	// events we need. Note that this method doesn't seem to work in Firefox. But since
	// this is a Chrome extension, who gives a crap, right?
	Element.prototype.realAddEventListener = Element.prototype.addEventListener;
	Element.prototype.addEventListener = function(eventName, callback, useCapture) {
		// Override with DRAGON DROPPING TECHNOLOGY
		if (drag_events.indexOf(eventName) > -1) {
			if (drag_events_we_actually_care_about.indexOf(eventName) > -1) {
				switch (eventName) {
					case 'dragstart': this.setAttribute('dragondrop-draggable', 'true'); break;
					case 'drop': this.setAttribute('dragondrop-droppable', 'true'); break;
				}
			}

			var dragondrop_event = document.createEvent('CustomEvent');
			dragondrop_event.initCustomEvent('DragonDropUpdate', false, false, {
				eventName: eventName,
				element: this,
				callback: dd_bind(callback, this) // MUST BIND TO PROPER CONTEXT
			});
			dragondrop_el.dispatchEvent(dragondrop_event);
			return;
		}

		this.realAddEventListener(eventName, callback, useCapture);
	}
})();

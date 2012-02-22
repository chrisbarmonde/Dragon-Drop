$.fn.extend({
	exists: function() {
		return this.length > 0;
	},
	realOn: function(eventName, callback) {
		this.get(0).realAddEventListener(eventName, callback, false);
		return this;
	}
});

// From prototypejs
Function.prototype.bind = function(a) {
	if (arguments.length < 2 && typeof arguments[0] === 'undefined') return this;
	var b = this,
		c = Array.prototype.slice.call(arguments).slice(1);
	return function () {
		var d = c.concat(Array.prototype.slice.call(arguments));
		return b.apply(a, d)
	}
};

// Need a way to determine if the dataTransfer object actually has data attached. If it doesn't, then
// some browsers will just not fire certain drag events.
_.extend(Clipboard.prototype, {
	dataSet: false,
	realSetData: Clipboard.prototype.setData,
	setData: function(mime_type, data) {
		this.dataSet = true;
		this.realSetData(mime_type, data);
	},
	hasData: function() {
		return this.dataSet || this.files.length > 0 || this.items.length > 0;
	}
})

var DragonDrop = function(options) {
	// Whether or not the dragon is on the prowl
	this.dragon_comin_yo = false;

	// Farmland is a combination of lairs and dropzones.
	// Anything that might be able to be burned down.
	this.farmland = [];

	// Lairs are where the dragons reside (draggable elements)
	this.lairs = [];

	// Dropzones are where the dragons end up (droppable elements)
	this.dropzones = [];

	// Options for this dragon and how it's displayed
	this.dragon_options = options.dragon;

	// The image  for the dragon
	this.dragon = $('<img/>')
		.css('opacity', '0.5', 'important') // This doesn't do anything. lollerskates.
		.prop('src', chrome.extension.getURL(this.dragon_options.image));

	// The particle engine that generates the flame
	this.dragon_breath = new FlameParticleEngine(this.dragon_options.particleEngine);

	this.flame_options = options.flames;

	this.active = false;
	this.enabled = false;
};

_.extend(DragonDrop.prototype, {
	enable: function() {
		this.enabled = true;
		_.each(this.farmland, function(farmland) {
			farmland.enable();
		});
	},

	disable: function() {
		this.enabled = false;
		_.each(this.farmland, function(farmland) {
			farmland.disable();
		});
	},

	/**
	 * Make an element on the page Dragon Droppable. Dragon Drop works by
	 * overriding the drag events and applying a bunch of canvas elements
	 * on top of other elements, so this sets all that up.
	 */
	attachFarmland: function(element, opts) {
		var farmland = this.getFarmland(element);

		if (farmland.isDraggable() && !this.isLair(farmland)) {
			this.lairs.push(farmland);
			farmland.$el.realOn('dragstart', farmland.bindCallback('dragstart', this.dragstart.bind(this)))
				.realOn('drag', farmland.bindCallback('drag', this.drag.bind(this)))
				.realOn('dragend', farmland.bindCallback('dragend', this.dragend.bind(this)));
		}

		if (farmland.isDroppable() && !this.isDropzone(farmland)) {
			this.dropzones.push(farmland);
			farmland.$el.realOn('dragover', farmland.bindCallback('dragover', function(event) {
					event.preventDefault();
					// If the dragon is active, set this place ablaze
					if (this.dragon_comin_yo) {
						farmland.burninate();
					}
				}.bind(this)))
				.realOn('drop', farmland.bindCallback('drop', function(event) {
					// If the dragon's landing, blow this place right on up
					if (this.dragon_comin_yo) {
						farmland.explode();
					}
				}.bind(this)))
				.realOn('dragenter', farmland.bindCallback('dragenter', function(event) { event.preventDefault(); }))
				.realOn('dragleave', farmland.bindCallback('dragleave'));
		}

		return farmland;
	},

	getFarmland: function(element) {
		// Check first if we already have this element set up
		for (var i = 0; i < this.farmland.length; i++) {
			var farmland = this.farmland[i];
			if (farmland.el == element.get(0)) {
				return farmland;
			}
		}

		var farmland = new DragonDropFarmland({el: element, flame: this.flame_options});
		farmland.enabled = this.enabled;
		this.farmland.push(farmland);

		return farmland;
	},

	dragstart: function(event) {
		// This sets up the custom image from the config.
		var pos = this.dragon_options.position;
		event.dataTransfer.setDragImage(
			this.dragon.get(0), pos[0], pos[1]
			// Use this line if you just want to see the flame
			//new Image(), pos[0], pos[1]
		);

		if (!event.dataTransfer.hasData()) {
			// Required in order for drag events to trigger in some browsers?
			event.dataTransfer.setData('text/plain', 'this is some awesome text');
		}

		this.dragon_breath.start();
		this.dragon_comin_yo = true;

		_.each(this.dropzones, function(dropzone) { dropzone.$el.css('opacity', '0.8'); });
	},

	/**
	 * Adjusts the position of the flame on drag relative to the dragon
	 */
	drag: function(event) {
		this.dragon_breath.move(event, this.dragon_options.flamePosition);
	},

	dragend: function(event) {
		this.dragon_comin_yo = false;
		this.dragon_breath.end();

		_.each(this.dropzones, function(dropzone) { dropzone.$el.css('opacity', '1.0'); });

		this.extinguish();
	},

	/**
	 * Kills all the canvas elements
	 */
	extinguish: function() {
		_.each(this.dropzones, function(target) {
			target.extinguish();
		});
	},

	isLair: function(farmland) {
		for (var i = 0; i < this.lairs.length; i++) {
			var lair = this.lairs[i];
			if (lair.el == farmland.el) {
				return true;
			}
		}

		return false;
	},

	isDropzone: function(farmland) {
		for (var i = 0; i < this.dropzones.length; i++) {
			var dropzone = this.dropzones[i];
			if (dropzone.el == farmland.el) {
				return true;
			}
		}

		return false;
	}
});

var DragonDropFarmland = function(options) {
	// Whether or not this element has been lit up already
	this.on_fire = false;

	// Holds the actual particle engine generating the flame
	this.flame = null;
	this.flame_options = options.flame;

	// Callbacks set by the original page creator
	this.page_callbacks = {};

	// Callbacks set by me!
	this.callbacks = {};

	this.$el = options.el;
	this.el = this.$el.get(0);
	this.enabled = false;
}

_.extend(DragonDropFarmland.prototype, {
	enable: function() {
		this.enabled = true;
	},

	disable: function() {
		this.enabled = false;
	},

	addCallback: function(eventName, callback) {
		if (!this.page_callbacks[eventName]) {
			this.page_callbacks[eventName] = [];
		}

		this.page_callbacks[eventName].push(callback);
	},

	bindCallback: function(eventName, cb) {
		console.log("Binding for " + eventName);

		this.callbacks[eventName] = function(event) {
			try {
				// Make sure that if the originating page has set any
				// specific callbacks, we actually call them! Even though
				// these were set on the page, the context should be bound
				// properly so they should still work (and apparently do! magic.)
				if (!!this.page_callbacks[eventName]) {
					_.each(this.page_callbacks[eventName], function(callback) {
						callback(event);
					})
				}
			} catch (e) {
				// Ignore any stupid crap the site dev does, I guess???
				console.log("Dragon Drop Error: ");
				console.log(e.message);
			}

			// Fire the DD callback only if we're actually active
			if (this.enabled && typeof cb == "function") {
				cb(event);
			}
		}.bind(this);

		return this.callbacks[eventName];
	},

	isDraggable: function() {
		return this.$el.attr('dragondrop-draggable');
	},

	isDroppable: function() {
		return this.$el.attr('dragondrop-droppable');
	},

	burninate: function() {
		// Turn the flame on if we need to, otherwise, just don't do anything
		if (!!this.flame) {
			if (!this.on_fire) {
				this.flame.start();
				this.on_fire = true;
			}
			return;
		}

		var w = this.$el.width();
		var h = this.$el.height();

		this.on_fire = true;

		// Oh god, math
		// The flames on the elements are controlled by the config. There are
		// some number of sources generating the flame particles, and we space
		// them out evenly here so they're not all crazy and overlapping and dumb.
		// I think this works????
		var sources = [];
		for (var i = 1; i <= this.flame_options.sources; i++) {
			sources.push([
				Math.floor((w / (this.flame_options.sources + 1)) * i + (this.flame_options.width_modifier / 2)),
				Math.floor(h + (this.flame_options.height_modifier / 2))
			]);
		}

		var offset = this.$el.offset();

		// The canvas element is also created, by default, slightly larger than the
		// original element (so that the flames can extend a little beyond the element
		// to make it somewhat more realistic). This sets that up.
		var top = offset.top - Math.floor(this.flame_options.height_modifier / 2);
		var left = offset.left - Math.floor(this.flame_options.width_modifier / 2);
		var width = w + this.flame_options.width_modifier;
		var height = h + this.flame_options.height_modifier;

		this.flame = new FlameParticleEngine({
			el: this.$el,
			debug: this.flame_options.debug,
			width: width,
			height: height,
			top: top,
			left: left,
			max_particles: sources.length * this.flame_options.max_particles_modifier,
			particle: _.defaults({source: sources}, this.flame_options.particle),
			explosion: _.defaults({source: [[Math.floor(width / 2), Math.floor(height / 2)]]}, this.flame_options.explosion)
		});


		// This last part is kind of important. Since we're overlaying a canvas element on
		// top of the original element, we need to *pass through* the original events so
		// that everything is called as expected.

		if (this.isDraggable()) {
			this.flame.addEvent('dragstart', function(event) { this.callbacks['dragstart'](event.originalEvent); }.bind(this));
		}

		if (this.isDroppable()) {
			this.flame
				.addEvent('drop', function(event) { this.callbacks['drop'](event.originalEvent); }.bind(this))
				.addEvent('dragenter', function(event) { event.preventDefault(); })
				.addEvent('dragover', function(event) { event.preventDefault(); });
		}

		this.flame.start();
	},

	extinguish: function() {
		if (!this.on_fire) {
			return;
		}

		this.flame.end(this.flame_options.extinguish_time);
		this.on_fire = false;
	},

	explode: function() {
		console.log("EXPLODIN'");
		this.flame.explode(this.$el, this.flame_options.extinguish_time);
	}
});

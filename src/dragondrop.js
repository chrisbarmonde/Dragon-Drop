
var DragonDrop = function(options) {
	this.dragon_comin_yo = false;
	this.farmland = [];
	this.lairs = [];
	this.dropzones = [];

	this.dragon_options = options.dragon;
	this.dragon = $('<img/>')
		.css('opacity', '0.5', 'important')
		.prop('src', chrome.extension.getURL(this.dragon_options.image));
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
					if (this.dragon_comin_yo) {
						farmland.burninate();
					}
				}.bind(this)))
				.realOn('drop', farmland.bindCallback('drop', function(event) {
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
		var pos = this.dragon_options.position;
		event.dataTransfer.setDragImage(
			this.dragon.get(0), pos[0], pos[1]
		);

		if (!event.dataTransfer.hasData()) {
			// Required in order for drag events to trigger in some browsers?
			event.dataTransfer.setData('text/plain', 'this is some awesome text');
		}

		this.dragon_breath.start();
		this.dragon_comin_yo = true;

		_.each(this.dropzones, function(dropzone) { dropzone.$el.css('opacity', '0.8'); });
	},

	drag: function(event) {
		this.dragon_breath.move(event, this.dragon_options.flamePosition);
	},

	dragend: function(event) {
		this.dragon_comin_yo = false;
		this.dragon_breath.end();

		_.each(this.dropzones, function(dropzone) { dropzone.$el.css('opacity', '1.0'); });

		this.extinguish();
	},

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
	this.on_fire = false;
	this.flame = null;
	this.flame_options = options.flame;
	this.page_callbacks = {};
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

		var sources = [];
		for (var i = 1; i <= this.flame_options.sources; i++) {
			sources.push([
				Math.floor((w / (this.flame_options.sources + 1)) * i + (this.flame_options.width_modifier / 2)),
				Math.floor(h + (this.flame_options.height_modifier / 2))
			]);
		}

		var offset = this.$el.offset();

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

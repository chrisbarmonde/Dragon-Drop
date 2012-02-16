var dragons = {
	// Name of the image
	'dragon.jpg': {
		position: [125, 200], // Position of dragon relative to cursor
		flamePosition: [-510, 10], // Position of flame relative to cursor
		particleEngine: {
			debug: false, // adds some extra logging + bounding box
			width: 500, // Width of canvas element
			height: 500, // Height of canvas element
			max_particles: 50, // Max number of particles at a time (more generally = longer flame)
			particle: {
				source: [425, 60], // Where the flame begins, relative to canvas element bounds

				// These are ranges of values so give some randomization to the flame
				// so [4, 8] means the y-axis velocity will be between 4 and 8, randomly per-particle
				velX: [-8, -6], // X-axis velocity
				velY: [4, 8], // Y-axis velocity
				size: [2, 5], // Size of the particle
				gravity: [-.1, .1], // Affect of gravity on the particle. Negative pulls up, positive pulls down
				drag: 1.0, // Drag on the particle (how fast/slow it is, typically shouldn't go below like 0.95)
				shrink: .99, // How quickly the particle shrinks (0.0-1.0)
				compositeOperation: 'lighter' // You want this to have it blend on screen, but you can change it if you're dumb
			}
		}
	}
};


var DragonDrop = function(options) {
	this.dragon_comin_yo = false;
	this.farmland = [];
	this.lairs = [];
	this.dropzones = [];

	this.dragon_type = options.dragon;
	this.dragon_options = dragons[this.dragon_type];
	this.dragon = $('<img/>')
		.css('opacity', 1)
		.prop('src', chrome.extension.getURL('images/dragons/' + this.dragon_type));
	this.dragon_breath = new FlameParticleEngine(this.dragon_options.particleEngine);
};

_.extend(DragonDrop.prototype, {
	attachFarmland: function(element, opts) {
		var farmland = this.getFarmland(element);

		if (farmland.isDraggable() && !this.isLair(farmland)) {
			this.lairs.push(farmland);
			farmland.$el.on('dragstart.dragondrop', this.dragstart.bind(this))
					  .on('drag.dragondrop', this.drag.bind(this))
					  .on('dragend.dragondrop', this.dragend.bind(this));
		}

		if (farmland.isDroppable() && !this.isDropzone(farmland)) {
			this.dropzones.push(farmland);
			farmland.$el.on('dragover.dragondrop', farmland.burninate.bind(farmland))
						.on('drop.dragondrop', farmland.explode.bind(farmland));
		}
	},

	getFarmland: function(element) {
		for (var i = 0; i < this.farmland.length; i++) {
			var farmland = this.farmland[i];
			if (farmland.el == element.get(0)) {
				return farmland;
			}
		}

		var farmland = new DragonDropFarmland({el: element});
		this.farmland.push(farmland);

		return farmland;
	},

	dragstart: function(event) {
		var pos = this.dragon_options.position;
		event.originalEvent.dataTransfer.setDragImage(
			this.dragon.get(0), pos[0], pos[1]
		);
		this.dragon_breath.start();
		this.dragon_comin_yo = true;

		_.each(this.dropzones, function(dropzone) { dropzone.$el.css('opacity', '0.8'); });
	},

	drag: function(event) {
		this.dragon_breath.move(event.originalEvent, this.dragon_options.flamePosition);
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
	this.flames = [];
	this.$el = options.el;
	this.el = this.$el.get(0);
}

_.extend(DragonDropFarmland.prototype, {
	isDraggable: function() {
		return this.$el.attr('dragondrop-draggable');
	},

	isDroppable: function() {
		return this.$el.attr('dragondrop-droppable');
	},

	burninate: function() {
console.log('burninating');
		if (this.flames.length > 0) {
			if (!this.on_fire) {
				_.each(this.flames, function(flame) {
					flame.start();
				});

				this.on_fire = true;
			}
			return;
		}

		var w = this.$el.width();
		var h = this.$el.height();

		this.on_fire = true;

		// @todo configurable
		for (var i = 1; i <= 3; i++) {
			var flame = new FlameParticleEngine({
				debug: false,
				width: w + 100,
				height: h + 100,
				max_particles: 10,
				particle: {
					source: [w / 3 * i, h + 20],
					velX: [-10, 10],
					velY: [-6, -18],
					size: [3, 6],
					gravity: [-.75, -.85],
					drag: .95,
					shrink: .98,
					compositeOperation: 'lighter'
				}
			});

			var offset = this.$el.offset();
			flame.canvas.css({
				'top': (offset.top - 100) + 'px',
				'left': (offset.left - 50) + 'px'
			});
			flame.start();

			this.flames.push(flame);
		}
	},

	extinguish: function() {
		if (!this.on_fire) {
			return;
		}

		_.each(this.flames, function(flame) {
			flame.end(3000);
		});

		this.on_fire = false;
	},

	explode: function() {

	}
});

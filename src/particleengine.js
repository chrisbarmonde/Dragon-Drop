
var FlameParticleEngine = function(options) {
	this.options = {
		width: 500,
		height: 500,
		max_particles: 30,
		debug: false,
		particle: {}
	};
	_.extend(this.options, options);

	this.particles = [];
	this.interval = null;
	this.finish = false;
	this.max_particles = this.options.max_particles;
	this.events = {};

	this.canvas = $('<canvas/>')
		.prop('width', this.options.width)
		.prop('height', this.options.height)
		.css('z-index', '100000')
		.css('position', 'absolute');
	this.context = this.canvas[0].getContext('2d');
};

_.extend(FlameParticleEngine.prototype, {
	log: function(msg) {
		if (!this.options.debug) {
			console.log(msg);
		}
	},

	addEvent: function(eventName, callback) {
		this.events[eventName] = callback;
		return this;
	},

	start: function() {
		this.log('starting');

		if (!this.finish) {
			$('body').append(this.canvas);
			this.interval = setInterval(this.loop.bind(this), 500 / this.max_particles); //@todo not hardcode?

			// re-add events
			_.each(this.events, function(event, eventName) {
				this.canvas.on(eventName, event);
			}.bind(this));
		} else {
			this.finish = false;
		}
	},

	end: function(delay) {

		var end = function() {
			this.log('ending');
			this.canvas.remove();
			clearInterval(this.interval);
			this.finish = false;
		}.bind(this);

		if (!!delay) {
			this.finish = true;
			_.delay(function(){
				if (this.finish) {
					end();
				}
			}.bind(this), delay);
		} else {
			end();
		}
	},

	explode: function() {
		this.makeParticle(3 * this.max_particles, this.options.explosion);
	},

	loop: function() {

		// make a particle
		if (!this.finish) {
			this.makeParticle(1, this.options.particle);
		}

		// clear the canvas
		if (this.options.debug) {
			// fill with black so you can see bounding box
			this.context.fillColor = 'rgb(0,0,0)';
			this.context.fillRect(0, 0, this.options.width, this.options.height);
		} else {
			this.context.clearRect(0, 0, this.options.width, this.options.height);
		}

		// iteratate through each particle
		for (i = 0; i < this.particles.length; i++) {
			var particle = this.particles[i];
			particle.render(this.context);

			// We always render first so particle
			// appears in the starting point.
			particle.update();
		}

		// Keep taking the oldest particles away until we have
		// fewer than the maximum allowed.
		while (!this.finish && this.particles.length > this.max_particles) {
			this.particles.shift();
		}
	},

	makeParticle: function(particleCount, opts) {
		for (var i = 0; i < particleCount; i++) {

			// Get a random source to add to
			var source = _.shuffle(opts.source)[0];
			var particle = new GlowParticle(source[0], source[1]);

			// Give particle random settings
			particle.velX = randomRange(opts.velX[0], opts.velX[1]);
			particle.velY = randomRange(opts.velY[0], opts.velY[1]);
			particle.size = randomRange(opts.size[0], opts.size[1]);
			particle.gravity = randomRange(opts.gravity[0], opts.gravity[1]);
			particle.drag = opts.drag;
			particle.shrink = opts.shrink;
			particle.compositeOperation = opts.compositeOperation;

			this.particles.push(particle);
		}
	},

	move: function(event, offset) {
		event.preventDefault();
		this.canvas.css({
			'left': (event.pageX + offset[0]) + 'px',
			'top': (event.pageY + offset[1]) + 'px'
		});
	}
});

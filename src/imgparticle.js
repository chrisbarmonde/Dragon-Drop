
var TO_RADIANS = Math.PI / 180;

function GlowParticle(posx, posy) {

	// the position of the particle
	this.posX = posx;
	this.posY = posy;
	// the velocity
	this.velX = 0;
	this.velY = 0;

	// multiply the particle size by this every frame
	this.shrink = 1;
	this.size = 1;
	// if maxSize is a positive value, limit the size of
	// the particle (this is for growing particles).
	this.maxSize = -1;

	// if true then make the particle flicker
	this.shimmer = false;

	// multiply the velocity by this every frame to create
	// drag. A number between 0 and 1, closer to one is
	// more slippery, closer to 0 is more sticky. values
	// below 0.6 are pretty much stuck :)
	this.drag = 1;

	// add this to the yVel every frame to simulate gravity
	this.gravity = 0;

	// current transparency of the image
	this.alpha = 1;
	// subtracted from the alpha every frame to make it fade out
	this.fade = 0;

	// the amount to rotate every frame
	this.spin = 0;
	// the current rotation
	this.rotation = 0;

	// Color for the particles
	this.colors = {};

	// the blendmode of the image render. 'source-over' is the default
	// 'lighter' is for additive blending.
	this.compositeOperation = 'source-over';
}

_.extend(GlowParticle.prototype, {

	update: function() {

		// simulate drag
		this.velX *= this.drag;
		this.velY *= this.drag;

		// add gravity force to the y velocity
		this.velY += this.gravity;

		// and the velocity to the position
		this.posX += this.velX;
		this.posY += this.velY;

		// shrink the particle
		this.size *= this.shrink;
		// if maxSize is set and we're bigger, resize!
		if((this.maxSize>0) && (this.size>this.maxSize))
			this.size = this.maxSize;

		// and fade it out
		this.alpha -= this.fade;
		if(this.alpha<0) this.alpha = 0;

		// rotate the particle by the spin amount.
		this.rotation += this.spin;
	},

	render: function(c) {

		// if we're fully transparent, no need to render!
		if (this.alpha == 0) return;

		// save the current canvas state
		c.save();


		// move to where the particle should be
		c.translate(this.posX, this.posY);

		// scale it dependent on the size of the particle
		var s = this.shimmer ? this.size * Math.random() : this.size;
		c.scale(s,s);


		// set the alpha to the particle's alpha
		c.globalAlpha = this.alpha;

		// set the composition mode
		c.globalCompositeOperation = this.compositeOperation;

		// Draw circle
		c.beginPath();
		c.arc(0, 0, this.colors.radius, 0, Math.PI*2, true);
		c.closePath();

		// Create gradient for colors
		var g = c.createRadialGradient(0, 0, 0, 0, 0, this.colors.radius);
		_.each(this.colors.stops, function (color) {
			g.addColorStop(color[0], color[1]);
		});

		c.fillStyle = g;
		c.fill();


		// and restore the canvas state
		c.restore();
	}
});

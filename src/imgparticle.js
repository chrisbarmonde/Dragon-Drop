/**
This is largely based on code written by Seb and can be found here:
https://github.com/sebleedelisle/JavaScript-PixelPounding-demos

Copyright (c)2010-2011, Seb Lee-Delisle, sebleedelisle.com
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


var TO_RADIANS = Math.PI / 180;

function GlowParticle(posx, posy, img) {

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
};
GlowParticle.images = {};

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
		c.globalCompositeOperation = this.colors.compositeOperation;

		if (!!this.colors.image) {
			var image = GlowParticle.images[this.colors.image];
			if (!image) {
				image = new Image();
				image.src = chrome.extension.getURL(this.colors.image);
				GlowParticle.images[this.colors.image] = image;
			}

			var modifier = Math.ceil(s * this.colors.image_size_modifier);

			// and rotate
			c.rotate(this.rotation * TO_RADIANS);
			// move the draw position to the center of the image

			c.translate(0, 0);
			//c.globalCompositeOperation = "source-over";
			c.drawImage(image, modifier * -0.5, modifier * -0.5, modifier, modifier);
		}

		if (!!this.colors.stops) {
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
		}

		// and restore the canvas state
		c.restore();
	}
});

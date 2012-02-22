var config = {
	"dragons": {
		"default": {
			"image": "images/dragons/dragon.jpg",
			"position": [125, 200],
			"flamePosition": [-510, 10],
			"particleEngine": {
				"debug": false,
				"width": 500,
				"height": 500,
				"max_particles": 50,
				"particle": {
					"source": [[425, 60]],
					"velX": [-8, -6],
					"velY": [4, 8],
					"size": [2, 5],
					"gravity": [-.1, .1],
					"drag": 1.0,
					"shrink": .99,
					"compositeOperation": "lighter"
				}
			}
		}
	},

	"flames": {
		"debug": false,
		"width_modifier": 100,
		"height_modifier": 100,
		"sources": 3,
		"max_particles_modifier": 10,
		"extinguish_time": 3000,
		"particle": {
			"velX": [-10, 10],
			"velY": [-4, -12],
			"size": [4, 9],
			"gravity": [-.55, .01],
			"drag": .96,
			"shrink": .98,
			"compositeOperation": "lighter"
		}
	}
}

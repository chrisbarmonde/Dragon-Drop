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
					"color": "dragon-red",
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
		"sources": 6,
		"max_particles_modifier": 5,
		"extinguish_time": 3000,
		"particle": {
			"velX": [-10, 10],
			"velY": [-4, -12],
			"size": [4, 9],
			"gravity": [-.55, .01],
			"drag": .96,
			"shrink": .98,
			"compositeOperation": "lighter"
		},
		"explosion": {
			"velX": [-20, 20],
			"velY": [-20, 20],
			"size": [4, 9],
			"gravity": [0, 0],
			"drag": .99,
			"shrink": .99,
			"compositeOperation": "lighter"
		}
	},

	"colors": {
		"dragon-red": {
			"radius": 15,
			"stops": [
				[0, 'rgba(255,255,255,.80)'],
				[0.4, 'rgba(255,255,255,.70)'],
				[0.45, 'rgba(255,255,0,.60)'],
				[0.55, 'rgba(255,0,0,.50)'],
				[0.8, 'rgba(255,0,0,.45)'],
				[0.95, 'rgba(255,0,0,.25)'],
				[1, 'rgba(255,0,0,.01)']
			]
		},
		"dragon-blue": {
			"radius": 15,
			"stops": [
				[0, 'rgba(255,255,255,.80)'],
				[0.4, 'rgba(255,255,255,.70)'],
				[0.45, 'rgba(0,255,255,.60)'],
				[0.55, 'rgba(0,0,255,.50)'],
				[0.8, 'rgba(0,0,255,.45)'],
				[0.95, 'rgba(0,0,255,.25)'],
				[1, 'rgba(0,0,255,.01)']
			]
		},
		"dragon-green": {
			"radius": 15,
			"stops": [
				[0, 'rgba(255,255,255,.80)'],
				[0.4, 'rgba(255,255,255,.70)'],
				[0.45, 'rgba(0,255,255,.60)'],
				[0.55, 'rgba(0,255,0,.50)'],
				[0.8, 'rgba(0,255,0,.45)'],
				[0.95, 'rgba(0,255,0,.25)'],
				[1, 'rgba(0,255,0,.01)']
			]
		}
	},

	"defaultColor": "dragon-red"

}

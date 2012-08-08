#Dragon Drop
Tired of boring HTML5 drag-and-drop? Enjoy medieval fantasy? Are you perhaps a part-time arsonist? Then let me introduce you to Dragon Drop, the Chrome extension that allows you to convert your normal, pansy drag-and-drop websites into a terrifying wasteland of burning despair.

## What.
Perhaps a picture will better illustrate.

![DRAGON DROP](http://infalliblelogic.com/dragon-drop/dragon-drop.jpg)

## No, seriously. What.
Okay, so I was bored, and I had a good pun. This was mainly to see what I could get away with using Chrome extensions, and the answer is __a lot__.

* You can inject any Javascript directly into any page.
* That javascript can still talk with the extension in a roundabout way, despite them not really wanting you to be able to do that.
* You can completely intercept every single event on a page! Neat!
* You can call callbacks from the page's original scope inside of the extension and it'll still work. Didn't _really_ expect that to work, but it makes some sense.
* Other stuff?? I don't know. Who cares.

## How Dragon Drop Works
Hopefully you know something about Chrome extensions because I sure am not gonna go over that! [Go here](http://code.google.com/chrome/extensions/overview.html) if you need a primer.

Dragon Drop work as a content script that runs at document_start. You can see what is essentially the primary starting point in `src/content_script.js`. This injects ```src/inject.js``` directly into the page. inject.js overrides `addEventListener()` on the page to intercept every event call (hopefully). If it finds a drag event, it does some magic and fires a custom event that the extension can handle. Everything else is just passed through like normal and no one knows anything is happening. Sweet.

On the extension's end, once the drag actually happens, it uses the HTML Drag-and-Drop API to set up a custom image (WHICH IS PROBABLY A DEADLY DRAGON, though you can change that) and create a canvas element that it uses for the dragon's all-searing flame.

Any elements that are droppable have a similar treatment: A canvas element is overlaid on top of the element which will set ablaze once the dragon passes over. If the dragon is actually dropped, it'll explode the element (temporarily and spectacularly) and pass through any necessary events to actually handle the original drop.


### Why This Was Stupid
For starters: Nothing uses the HTML5 Drag-and-Drop API.

It's a horrible piece of shit, is probably the main reason. There's no easier way to put it. It's still not "finished", sure, but as is, it's almost useless. It's a mishmash of needing Javascript and adding pointless attributes on HTML elements and none of the browsers handle any of it the same way, even the same browser on different operating systems!

Beyond that, the dataTransfer object that's used to pass info from the drag to the drop element is severely lacking in... I don't know, being useful? There are three or four different ways to check if it even HAS any data attached, which is kind of ludicrous. Even moreso when you realize that __some browsers will not honor the drag events if there isn't data attached__. What the hell. For reference, Webkit just uses the existing Clipboard object and has shoehorned some extra data in there. Heh.

My favorite part is when you want to replace a drag image with a custom image. _You can't adjust the image at all._ It ignores all CSS applied to it. You CAN apply CSS to an image if it's directly embedded on the page... but then it literally has to be _in the viewport_ in order to be used. It can't be hidden, it can't be `left:-10000px`'d or anything. It has to be visible, which kinda defeats the purpose. Awesome.

Basically, I would suggest people never ever ever ever ever ever ever use this API. It's beyond frustrating and it just doesn't work well at all and there are plenty of hand-rolled jQuery plugins and whatnot that do it better.

### But That's Okay
Because it's still kinda funny. And one of the config options lets you use a cat-breathing dragon instead of a fire-breathing dragon. I mean, this is the Internet after all.

### And Now I Want To Use It
Aw, good for you, buddy. I never submitted this to the Chrome store because, I mean, what's the point? It can be used almost nowhere. If you want to play around with it, you can just load it as an unpacked extension (Manage Extensions... in Chrome and then check the 'Developer Mode' box if you haven't). Then you can play on my test page here: http://infalliblelogic.com/dragon-drop/dd.html 

Or find a site that uses the API. I bet you money it's a tutorial!

If it's working, you'll see the little flame icon in your address bar and it'll be red and not gray!

## Configuration
Here is how you configure this crap. I was going to make an options page for the extension, and maybe some day when I'm super bored I will, but hey.

```javascript
var config = {
    // A list of all the dragons you can choose from. There's only one.
    "dragons": {
        "default": {
            // The image to use. Relative path in the extension for now.
            "image": "images/dragons/dragon.jpg",

            // The x,y offset relative to the mouse cursor.
            "position": [125, 200],

            // The x,y offset of the canvas element that contains the flame
            "flamePosition": [-510, 10],

            "particleEngine": {
                // Set to true to see the canvas bounding box better
                "debug": false,

                // Width and height of the canvas element. The important thing
                // is to make it so that the particles expire before they 
                // disappear over the edge of the bounding box.
                "width": 500,
                "height": 500,

                // Max number of particles to allow. Higher typically means
                // slower since you'll have more crap to render.
                "max_particles": 50, 

                // This determines the rendering of individual particles
                "particle": {
                    // Where in the canvas element (x,y) the flames will
                    // be generated from. This is the top right.
                    "source": [[425, 60]],

                    // A bunch of the next numbers are ranges. The script
                    // will pick a random number in the range to give some
                    // variation to the particles.

                    // The x-axis velocity. This determines how quickly
                    // and in which direction it travels on the x-axis.
                    // Negative numbers move left, positive to the right.
                    "velX": [-8, -6],

                    // y-axis velocity. Positive is up, negative is down.
                    "velY": [4, 8], 

                    // How big or small the particle is
                    "size": [2, 5], 

                    // How much gravity there is. Negative will pull the
                    // particle down, positive will pull it up.
                    "gravity": [-.1, .1],

                    // 1.0 is the max. Setting this lower is like adding
                    // friction to the particles. Anything below like 0.95
                    // is probably going to be kinda dumb unless you have
                    // a HUGE variation in velocity.
                    "drag": 1.0,

                    // 1.0 is the max. Determines how much the particle
                    // 'shrinks' as it ages. 1.0 means it will stay the same.
                    "shrink": .99,

                    // The color for the particle, using the color mapping
                    // further down (this will default to defaultColor below
                    // if it's omitted).
                    "color": "dragon-red"
                }   
            }   
        }   
    },  

    // This controls the flames that show up on the droppable elements.
    "flames": {
        // Same as above.
        "debug": false,

        // How many extra pixels to add to the canvas element on top
        // of the original element. So if the original element is 200px
        // wide, this would make the canvas element 300px (centered, so
        // 50px extra on each side). This is so that the particles can
        // extend beyond the boundaries of the element, which gives a 
        // slightly more realistic effect for something that's on fire!
        "width_modifier": 100,

        // Same as above, but for height.
        "height_modifier": 100,

        // How many particle sources there will be. More = slower, depending
        // on your computer and how you set max_particles_modifier. These
        // are spaced evenly along the bottom of the element and each source
        // will generate particles, so you get a slightly more realistic
        // flame effect
        "sources": 6,

        // This is multiplied by the sources to get the total number of
        // particles that will be generated, so you can modify them together
        // to get something that looks good.
        "max_particles_modifier": 5,

        // Time, in milliseconds, before the canvas element 'extinguishes'
        // (disappears) once the drag event has stopped. This is to allow
        // the flames to slowly fade out instead of just disappearing.
        "extinguish_time": 3000,

        // Same as the particle effects above.
        "particle": {
            "velX": [-10, 10],
            "velY": [-4, -12],
            "size": [4, 9], 
            "gravity": [-.55, .01],
            "drag": .96,
            "shrink": .98 
        },  
        
        // Same as the particle effects above, but this controls the 
        // particles for the explosion that occurs when the dragon is
        // dropped on a droppable element.
        "explosion": {
            "velX": [-20, 20],
            "velY": [-20, 20],
            "size": [4, 9], 
            "gravity": [0, 0], 
            "drag": .99,
            "shrink": .99 
        } 
    },

    // This sets up different types of flames  
    "colors": {
        "dragon-red": {
            // The canvas compositeOperation to use. Look 'em up, but
            // 'lighter' blends the particles together to give the nice
            // flame effect.
            "compositeOperation": "lighter",

            // The size of the radius for the gradient that's applied.
            "radius": 15,

            // The different stops in the gradient so you can make it
            // look all snazzy. This is just a list of rgba colors from
            // 0.0 - 1.0, and at each level that color is blended into the
            // next/previous color. It's a gradient.
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
        ...
        "happycat": {
            // If you want to use an image, this will work best.
            "compositeOperation": "source-over",

            // The image you want to use.
            "image": "images/happycat-bighead.gif",

            // A modifier for the size of the image. I honestly
            // forget what this means, but you can toggle it, I guess!
            "image_size_modifier": 5
        }
    },

    // The global default color. Any particle section that doesn't
    // have a color specified will use this.
    "defaultColor": "dragon-red"
}
```

## Licenses
Use this crap however the hell you want! I don't care. Though I guess I'd feel special if you told me.

All the images are pulled from The Internet(tm) and are Creative Commons images.

Parts of the particle engine are based on @sebleedelisle's demos that can be found here and carry their own license:
https://github.com/sebleedelisle/JavaScript-PixelPounding-demos

Debut
=====

Give your ideas the limelight.

**Disclaimer:** This readme is currently serving as a design document so this is non-functional.

# Programatic API (JS)

## Examples

```js
var presentation = new Debut(document.getElementById('debut-presentation');

var animatables = {
  number: 0
}

presentation.step('.section-1 h1', 'slide', { duration: 500, from: 'top' }) // Slide in the heading from the top
  .step('.section-1 .diagram', 'fade', { duration: 1000 }) // Fade in an image
  .then('.section-1 .diagram-caption', 'slide', { duration: 500, from: 'bottom' }) // Afterwards, slide the caption from the bottom
	.milestone('Diagram') // Indicate that this point in the presentation is one that we'd like to skip to in presenter view
  .step(animatables, 'property', { 
      duration: 2000, 
      values: { number: 500 },
      onstep: function (animatables) {
        $('.dollars').text('$' + animatables.number);
      }
    }) // Animate a number from 0 to 500 while updating the text of an element to represent that
  .and('.dollars', 'css', { 
      duration: 500, 
      values: { scale: 2 }
    }) // At the same time
	.activate(); // Start the presentation and manipulate all of the DOM stuff
```

## Debut Object

This object represents an entire presentation. Its primary job is to contain and handle the animation queue.

### `Debut({Object} element[, {Object} options])`

Creates a new Debut instance around the top level container element. The contents of this element should be your presentation.

The options object can contain the following options

```js
{
  aspect: Number // Aspect ratio of presentation
}
```

### `debut.step([{String|Object} element,] {String|Object|Function} animation, {Object} options)`

Adds an animation to the animation queue. The `element` can be a selector string, an element object, or an ordinary JS object. The animation can be a string with the name of a registered animation, an Animation object or an animation function of the form:

    function animation(context, callback) { }

Where `context` is an object with the following properties:

```js
{
  debut: Object, // Debut Instance
  animating: Object, // Object to be animating over (can be null)
  options: Object // Generic options and animation options
}
```

The `callback` function is to be called *when the animation is finished*.

The `options` object passes options to the animation object. There is a set of options that are reserved for every animation, and every other name can be used by animations as they please. The reserved options are:

```js
{
  duration: Number, // Duration of animation in ms. Animations don't have to respect it
  start: String, // Either 'step' (start on next click), 'with' (start at the same time as the last one), 'after' (start as the previous animation finishes)
  delay: Number, // Delay before the animation starts in ms
	direction: Number // Whether to play this animation forwards or backwards. -1 for backwards, 1 for forwards (default is 1)
}
```

Returns the Debut instance

### `debut.and()`

Same as `step` but the default property for the `start` option is 'with'. This means that this animation will start in sync with the previous animation.

### `debut.after()`

Same as `step` but the default property for the `start` option is 'after'. This means that this animation will start after the previous animation has finished.

### `debut.next()`

Animate to the next state

### `debut.prev()`

Animate to the previous state (yes, backwards animations supported)

### `debut.goTo({Number} index)`

Go to position `index` in the animation queue. Preferably this would be animated but reliably doing this would be a mission.

### `debut.openPresenterView`

Open presenter view. We will come back to this.


# Declarative API (DOM)
Debut
=====

Give your ideas the limelight.

**Disclaimer:** This readme is currently serving as a design document so this is non-functional.

Communicating our ideas effectively and convincingly is extremely important with today's fast-paced way of living. But when it comes to the ways we give presentations, we're still stuck in an old-school way of thinking.

## Slides are the Problem

We still think of a presentation as a series of slides. *Sure*, we can add a bunch of animations to it, but at the end of the day we still jump from one slide to the next.

Yes - some new age ideas have emerged recently. The infinite canvas method showcased by [Prezi](http://prezi.com) is very innovative, but its just another singular approach to presentations that we can get stuck in.

What if we had a blank canvas, and you have a series of animations that get executed?

Add some default styles and useful animations, and you could have yourself an infinite canvas "Prezi" style presentation, or a typical slides based presentation. Or anything that represents your ideas. Give them what they deserve.

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
  reversed: Boolean, // Whether the current animation is playing backwards (along the animation queue)
  direction: Number, // Direction the animation is playing in (with respect to the animation definition) - reversed is taken into account
  duration: Number, // The length of this animation in milliseconds
  store: Object, // Any properties stored in a beforeState function
  element: Object, // The object to be animated
  $element: Object // The object to be animated (guaranteed to be a jQuery object)
}
```

The `callback` function is to be called *when the animation is finished*.

The `options` object passes options to the animation object. There is a set of options that are reserved for every animation, and every other name can be used by animations as they please. The reserved options are:

```js
{
  duration: Number, // Duration of animation in ms. Animations don't have to respect it
  start: String, // Either 'step' (start on next click), 'with' (start at the same time as the last one), 'after' (start as the previous animation finishes)
  delay: Number, // Delay before the animation starts in ms
  direction: Number, // Whether to play this animation forwards or backwards. -1 for backwards, 1 for forwards (default is 1)
  reversed: Boolean // Alternate way of specifying direction (default is false)
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

The delcarative API works by iterating over the DOM tree inside the presentation container.
At any point, the programmatic API may have specified particular elements or selectors that
should have an animation added through a hook. This is different to simply adding an animation
with the programmatic API.

This is done in tandem with the programmatic API. By using the programmatic API, you are specifying
an element to be animated, which gives a position in the DOM tree. Between each of these calls,
the points on the DOM in between will be iterated over and relevant hooks called.

By default, a `data-` API will be used to allow inline animation declaration. But for ease of theming,
these hooks will be able to be leveraged by anything.

## data-anim

The value of this attribute can be treated as a JavaScript function call where the name of the 
function is the animation desired to be executed (as defined in `Debut.animations`), and the arguments
are the options. An optional second argument is the actual element to do the animation on,
as opposed to the element being iterated over.

    data-anim="name(options[, element])"

For example, this is how I would animate in an element with the `slide` class using the slide
animation:

    <div data-anim="slide({duration: 1000}, '.slide')"></div>

## data-anim-exit

This data attribute is the same as `data-anim` except it specifies that the animation
should be executed when the DOM iterater reaches the end of that element. By default,
the options will be set to `reverse: true` (unless the animation has a default). You can
easily override this by setting `reverse: false` in the options.

    <div data-anim-exit="slide({reverse: false})"></div>

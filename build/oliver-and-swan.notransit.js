/*! oliver-and-swan 2014-02-23 */
!function(exports, global) {
    function Animation(fun, params) {
        this.params = $.extend(!0, {
            easing: "easeInOutCubic"
        }, params), //Actual function to run for animation
        this.fun = fun, //Valid values for start are onstep, withprevious and afterprevious (not implemented)
        this.start = "onstep", //Delay between animation call and it being run (implemented by runner)
        this.delay = 0, //Element to run animation on
        this._elem = null, //Level of DOM in respect to presentation container
        this.depth = 1, //Clone of element before animation is run
        this.domClone = null, //Element full of notes for this animation
        this.notes = null, this.run = function(context, reverse, nparams, callback) {
            if (!reverse && !this.domClone) {
                this.domClone = $(this._elem).clone();
                //The transforms are not carried through due to some weird quirk with Transit
                //This is one of the only ways to actually do this
                var trans = ($(this._elem).css("transit:transform") || "").toString();
                $(this.domClone).css("transit:transform", new $.transit.Transform(trans)), this.params.domClone = this.domClone;
            }
            var extender = {};
            reverse && (extender.direction = -this.params.direction), this.fun(this._elem, context, $.extend(!0, {}, this.params, nparams || {}, extender), callback || function() {});
        };
    }
    // Takes a string seperated by hyphens (default) and converts it to camel case
    function toCamelCase(str, seperator) {
        return "undefined" == typeof seperator && (seperator = "-"), str.split(seperator).map(function(e, i) {
            return 0 === i ? e.charAt(0).toLowerCase() + e.slice(1) : e.charAt(0).toUpperCase() + e.slice(1);
        }).join("");
    }
    global["true"] = exports;
    var $ = jQuery, animations = {
        appear: function(elem, context, params, callback) {
            1 === params.direction ? $(elem).css("opacity", "") : -1 === params.direction && $(elem).css("opacity", 0), 
            callback();
        },
        slide: function(elem, context, params, callback) {
            //This animation has the object slide in (or out) from a particular side of the screen
            var leftShift = 0, topShift = 0;
            params = $.extend({
                side: "left"
            }, params), //Resets the object to its original position if going forwards
            //TODO: measure some sort of initial state and use this in case the object already uses translate x and y
            1 === params.direction && params.domClone && $(elem).css({
                x: $(params.domClone).css("x"),
                y: $(params.domClone).css("y")
            }), $(elem).css("opacity", 1);
            //The position given by $.fn.offset is scaled so we have to account for that
            var position = $(elem).offset();
            switch (position.left = (position.left - context.containerLeft) / context.scale, 
            position.top = (position.top - context.containerTop) / context.scale, params.side) {
              default:
              case "left":
                leftShift = -($(elem).width() + position.left);
                break;

              case "right":
                leftShift = context.containerWidth - position.left;
                break;

              case "top":
                topShift = -($(elem).height() + position.top);
                break;

              case "bottom":
                topShift = context.innerContainer.height() - position.top;
            }
            1 === params.direction && $(elem).css({
                x: "+=" + params.direction * leftShift,
                y: "+=" + params.direction * topShift
            }), $(elem).transit({
                x: "+=" + -params.direction * leftShift,
                y: "+=" + -params.direction * topShift
            }, params.duration, params.easing, callback);
        },
        animate: function(elem, context, params, callback) {
            var toGo = {};
            if (1 === params.direction) toGo = params.prop; else {
                var e = $(params.domClone);
                for (var i in params.prop) toGo[i] = e.css(i);
            }
            $(elem).transit(toGo, params.duration, params.easing, callback);
        },
        fade: function(elem, context, params, callback) {
            //Opacity sucks because we use it for hiding elements
            //TODO: Find a better way of hiding elements
            $(elem).transit({
                opacity: 1 === params.direction ? 1 : 0
            }, params.duration, params.easing, callback);
        }
    }, slideMasterOptions = [ {
        key: "letterbox",
        type: "boolean",
        "default": !1
    }, {
        key: "aspect-ratio",
        type: function(val) {
            // Takes a string, such as 4:3 and then converts it into a decimal ratio (4/3 ~= 1.33333)
            var arr = val.split(":");
            return parseFloat(arr[0]) / parseFloat(arr[1]);
        },
        "default": 16 / 9
    }, {
        key: "container-height",
        type: "number",
        "default": 500
    } ], presentationObjectOptions = [ {
        key: "anim",
        type: "animation",
        "default": null
    }, {
        key: "end-exit-children",
        type: "boolean",
        "default": !1
    }, {
        key: "end-exit",
        type: "animation",
        "default": null
    }, {
        key: "anim-children-step",
        type: "animation",
        "default": null
    } ], validTransforms = [ "x", "y", "z", "rotate", "rotate-x", "rotate-y", "scale", "scale-x", "scale-y" ];
    for (var i in validTransforms) presentationObjectOptions.push({
        key: validTransforms[i],
        type: "string",
        "default": null
    }), validTransforms[i] = toCamelCase(validTransforms[i]);
    var OliverAndSwan = function(outerContainer, options) {
        this.innerContainer = null, this.outerContainer = null, this.index = 0;
        var masterWidth, masterHeight, animationQueue = this.animationQueue = [], container = $('<div class="presentation-container"></div>'), slideMaster = outerContainer, domOptions = $(outerContainer).getDOMOptions(slideMasterOptions), $this = this;
        $(outerContainer).addClass("presentation-master"), options = $.extend({}, domOptions, options), 
        this.containerHeight = options.containerHeight, this.containerWidth = this.containerHeight * options.aspectRatio, 
        this.scale = 1, container.height(this.containerHeight), container.width(this.containerWidth), 
        container.css("transform-origin", "0 0"), this.containerLeft = 0, this.containerTop = 0, 
        this.depth = container.parents().length, this.resize = function() {
            var ratio;
            (slideMaster.width() != masterWidth || slideMaster.height() != masterHeight) && (masterWidth = slideMaster.width(), 
            masterHeight = slideMaster.height(), ratio = masterWidth / masterHeight, //If the viewport is wider, scale according to height
            ratio > options.aspectRatio ? ($this.scale = masterHeight / $this.containerHeight, 
            $this.containerLeft = (masterWidth - $this.scale * $this.containerWidth) / 2, $this.containerTop = 0) : ($this.scale = masterWidth / $this.containerWidth, 
            $this.containerLeft = 0, $this.containerTop = (masterHeight - $this.scale * $this.containerHeight) / 2), 
            container.css({
                left: $this.containerLeft,
                top: $this.containerTop
            }), container.css("scale", $this.scale));
        }, $(window).resize(this.resize), this.resize(), $(outerContainer).children("*").appendTo(container), 
        container.appendTo(outerContainer), this.outerContainer = $(outerContainer), this.innerContainer = container, 
        //Place all floaters in the centre of the screen using left and top
        // Would much rather use a combination of translate and translate3d
        // But this cannot be done until a fix for Webkit's gross 3D rendering is found
        container.find(".floater").each(function() {
            var left = ($this.containerWidth - $(this).width()) / 2, top = ($this.containerHeight - $(this).height()) / 2, options = $(this).getDOMOptions(presentationObjectOptions);
            $(this).css({
                top: top,
                left: left
            });
            for (var i in validTransforms) options[validTransforms[i]] && $(this).css(validTransforms[i], options[validTransforms[i]]);
        }), options.letterbox && $(this.outerContainer).addClass("letterbox");
        var addChildren = function() {
            var options = $(this).getDOMOptions(presentationObjectOptions), elem = $(this);
            //Is there a need to differentiate between entrance/exit animations and modifyer animations?
            //For the time being, one can just use data-exit to stop modifyer animations from being executed on childrenExit
            if (options.anim && (elem.css("opacity", 0), options.anim.params = $.extend({}, {
                direction: 1,
                duration: 500,
                easing: "in-out"
            }, options.anim.params), options.anim.depth = elem.parents().length - $this.depth, 
            elem.children(".notes").length && (options.anim.notes = elem.children(".notes"), 
            elem.children(".notes").remove()), animationQueue.push(options.anim)), options.animChildrenStep && $(this).children().each(function(key, val) {
                (void 0 === $(val).attr("data-anim") || $(val).attr("data-anim") === !1) && $(val).attr("data-anim", elem.attr("data-anim-children-step"));
            }), $(this).children().each(addChildren), options.endExitChildren) {
                $(this).children().each(function(key, val) {
                    childrenExit(val, !0);
                });
            } else options.endExit && (options.endExit.params = $.extend({}, {
                direction: -1,
                duration: 500,
                easing: "in-out"
            }, options.endExit.params), options.endExit.depth = elem.parents().length - $this.depth, 
            animationQueue.push(options.endExit));
        }, childrenExit = function(elem) {
            var options = $(elem).getDOMOptions(presentationObjectOptions);
            elem = $(elem), options.anim && !options.exit && (options.exit = $.extend(!0, new Animation(), options.anim)), 
            options.exit && (options.exit.params = $.extend({}, {
                direction: -1,
                duration: 500,
                easing: "in-out"
            }, options.exit.params), options.exit._elem = elem, options.exit.start = 0 !== elem.index() ? "withprevious" : "onstep", 
            options.exit.depth = elem.parents().length - $this.depth, animationQueue.push(options.exit));
        };
        this.innerContainer.children().each(addChildren), $(window).keydown(function(e) {
            //39 is right, 37 is left
            (39 === e.which || 37 === e.which) && $this.proceed(37 === e.which);
        }), $(this.outerContainer).click(function() {
            $this.proceed();
        }), window.onbeforeunload = function() {
            $this.presenterView && $this.presenterView.close();
        }, this.presenterView = null, // Opens up a window in presenter view and fires a function at it when it's ready
        this.openPresenterView = function(url, callback) {
            return $this.presenterView && $this.presenterView.close(), $this.presenterView = window.open(url, "Presenter"), 
            $($this.presenterView).load(function() {
                $this.presenterView.ready($this), callback && callback($this.presenterView);
            }), $this.presenterView.onbeforeunload = function() {
                $this.presenterView = null;
            }, $this.presenterView;
        }, // Binds an function to an event (just a wrapper for the jQuery equivalent)
        this.on = function(event, callback) {
            $($this).on(event, callback);
        }, // Triggers an event (again, jQuery)
        this.trigger = function(event, data) {
            $(this).trigger(event, data);
        }, // Method for jumping to a point in the presentation (by index)
        // Will do smooth animations until at lowermost required depth
        // Will then skip animations and then do smooth animations back up
        this.goTo = function(index) {
            var reverse = index < $this.index;
            if (index !== $this.index) {
                if (0 > index || index >= animationQueue.length) throw new Error("Index out of animation queue bounds");
                //var commonDepth = animationQueue[$this.index].depth, incrementMap = [];
                // Loop over all of the animations without running them
                // So we know what we have to do
                /*for (var i = $this.index; i != index; i += direction) {
            var animation = animationQueue[i];
            if (animation.depth < commonDepth) {
                commonDepth = animation.depth;
            }
        }*/
                // For now disregard what the comment describing this function says
                // We will go through all animations instantly
                // TODO: Make this function do as it says it does
                var proceed = function() {
                    // We have reached our goal or gone past it
                    reverse && $this.index <= index || !reverse && $this.index >= index || $this.proceed(reverse, 0, proceed);
                };
                proceed();
            }
        }, this.proceed = function(reverse, length, callback) {
            var fun, type;
            if (reverse = !!reverse) {
                if ($this.index <= 0) return;
                $this.index -= 1;
            } else if ($this.index >= animationQueue.length) return;
            fun = animationQueue[$this.index], type = fun.constructor.name;
            var extender = {};
            "undefined" != typeof length && (extender.duration = length), reverse || ($this.index += 1), 
            //nextind = $this.index + reverse ? -1 : 0;
            $this.trigger("animateStart", {}), $this.index in animationQueue && "withprevious" === animationQueue[$this.index].start ? (fun.run($this, reverse, extender), 
            0 === fun.delay ? $this.proceed(reverse, length, callback) : setTimeout(function() {
                $this.proceed(reverse, length, callback);
            }, fun.delay)) : fun.run($this, reverse, extender, callback || void 0);
        };
    };
    //Returns an object based on a DOM elements data attributes that match the template
    $.fn.getDOMOptions = function(template) {
        //if ($(this).data("domOptions")) return $(this).data("domOptions");
        var i, attr, type, key, val, options = {};
        for (i in template) {
            if (key = toCamelCase(template[i].key), attr = this.attr("data-" + template[i].key), 
            "undefined" != typeof attr) switch (type = template[i].type, typeof type) {
              //Is type a predefined value?
                case "string":
                switch (type) {
                  //Booleans will be true if the string evaluates to true or if no value is specified
                    case "boolean":
                    options[key] = !1, (attr || "" === attr) && (options[key] = !0);
                    break;

                  //Numbers will be parsed as floats. If it can't be parsed, the value is not set
                    case "number":
                  case "float":
                    val = parseFloat(attr), isNaN(val) ? "" === attr && (options[key] = 0) : options[key] = val;
                    break;

                  //Animation allows you to set attributes in JSON format
                    case "animation":
                    var anim = attr, parsed = attr ? attr.match(/([^{]+){([\s\S]+)/m) : null, params = {};
                    //TODO: Allow the passing of parameters to inline animations
                    if (parsed) //There really isn't any risk of using eval when it's the source code of a page being eval'd
                    //If you don't like it, tell me about a better alternative
                    params = eval("({" + parsed[2] + ")"), anim = parsed[1]; else if (//Checking if there is inline JS code in there
                    parsed = attr ? attr.match(/^{([\s\S]*)}$/m) : null) {
                        //Save the inline code in a function so it is already parsed but not executed
                        //This saves processing time when actually running the animation
                        var fun = eval("(function(elem,context,params,callback) {" + parsed[1] + "})");
                        options[key] = new Animation(fun, params);
                        break;
                    }
                    options[key] = anim in animations ? new Animation(animations[anim], params) : new Animation(animations.appear, params), 
                    options[key]._elem = $(this), params.start && (options[key].start = params.start), 
                    params.on && (options[key]._elem = $(params.on));
                    break;

                  //If it's a string, just set it directly (is also the default type)
                    case "string":
                  default:
                    options[key] = attr;
                }
                break;

              //Is it a function that will convert the string into the real value?
                case "function":
                val = type(attr), "undefined" != typeof val && (options[key] = val);
                break;

              //If we don't know, just assume it's a string
                default:
                options[key] = attr;
            }
            //If the object still hasn't got a value, pull the default one
            options.hasOwnProperty(key) || (options[key] = template[i].default);
        }
        return $(this).data("domOptions", options), options;
    }, //Where all the magic happpens
    $.fn.present = function(options) {
        return new OliverAndSwan($(this), options);
    }, //Make the OliverAndSwan object global
    $.OliverAndSwan = OliverAndSwan, OliverAndSwan.animations = animations;
}({}, function() {
    return this;
}());
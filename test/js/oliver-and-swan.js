/*! oliver-and-swan 2014-02-22 */
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
    global["true"] = exports, /*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
    function($) {
        // Helper function to get the proper vendor property name.
        // (`transition` => `WebkitTransition`)
        function getVendorPropertyName(prop) {
            // Handle unprefixed versions (FF16+, for example)
            if (prop in div.style) return prop;
            var prefixes = [ "Moz", "Webkit", "O", "ms" ], prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);
            if (prop in div.style) return prop;
            for (var i = 0; i < prefixes.length; ++i) {
                var vendorProp = prefixes[i] + prop_;
                if (vendorProp in div.style) return vendorProp;
            }
        }
        // Helper function to check if transform3D is supported.
        // Should return true for Webkits and Firefox 10+.
        function checkTransform3dSupport() {
            return div.style[support.transform] = "", div.style[support.transform] = "rotateY(90deg)", 
            "" !== div.style[support.transform];
        }
        // ## Transform class
        // This is the main class of a transformation property that powers
        // `$.fn.css({ transform: '...' })`.
        //
        // This is, in essence, a dictionary object with key/values as `-transform`
        // properties.
        //
        //     var t = new Transform("rotate(90) scale(4)");
        //
        //     t.rotate             //=> "90deg"
        //     t.scale              //=> "4,4"
        //
        // Setters are accounted for.
        //
        //     t.set('rotate', 4)
        //     t.rotate             //=> "4deg"
        //
        // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
        // functions.
        //
        //     t.toString()         //=> "rotate(90deg) scale(4,4)"
        //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
        //
        function Transform(str) {
            return "string" == typeof str && this.parse(str), this;
        }
        function callOrQueue(self, queue, fn) {
            queue === !0 ? self.queue(fn) : queue ? self.queue(queue, fn) : fn();
        }
        // ### getProperties(dict)
        // Returns properties (for `transition-property`) for dictionary `props`. The
        // value of `props` is what you would expect in `$.css(...)`.
        function getProperties(props) {
            var re = [];
            return $.each(props, function(key) {
                key = $.camelCase(key), // Convert "text-align" => "textAlign"
                key = $.transit.propertyMap[key] || $.cssProps[key] || key, key = uncamel(key), 
                // Convert back to dasherized
                // Get vendor specify propertie
                support[key] && (key = uncamel(support[key])), -1 === $.inArray(key, re) && re.push(key);
            }), re;
        }
        // ### getTransition()
        // Returns the transition string to be used for the `transition` CSS property.
        //
        // Example:
        //
        //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
        //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
        //
        function getTransition(properties, duration, easing, delay) {
            // Get the CSS properties needed.
            var props = getProperties(properties);
            // Account for aliases (`in` => `ease-in`).
            $.cssEase[easing] && (easing = $.cssEase[easing]);
            // Build the duration/easing/delay attributes for it.
            var attribs = "" + toMS(duration) + " " + easing;
            parseInt(delay, 10) > 0 && (attribs += " " + toMS(delay));
            // For more properties, add them this way:
            // "margin 200ms ease, padding 200ms ease, ..."
            var transitions = [];
            return $.each(props, function(i, name) {
                transitions.push(name + " " + attribs);
            }), transitions.join(", ");
        }
        function registerCssHook(prop, isPixels) {
            // For certain properties, the 'px' should not be implied.
            isPixels || ($.cssNumber[prop] = !0), $.transit.propertyMap[prop] = support.transform, 
            $.cssHooks[prop] = {
                get: function(elem) {
                    var t = $(elem).css("transit:transform");
                    return t.get(prop);
                },
                set: function(elem, value) {
                    var t = $(elem).css("transit:transform");
                    t.setFromString(prop, value), $(elem).css({
                        "transit:transform": t
                    });
                }
            };
        }
        // ### uncamel(str)
        // Converts a camelcase string to a dasherized string.
        // (`marginLeft` => `margin-left`)
        function uncamel(str) {
            return str.replace(/([A-Z])/g, function(letter) {
                return "-" + letter.toLowerCase();
            });
        }
        // ### unit(number, unit)
        // Ensures that number `number` has a unit. If no unit is found, assume the
        // default is `unit`.
        //
        //     unit(2, 'px')          //=> "2px"
        //     unit("30deg", 'rad')   //=> "30deg"
        //
        function unit(i, units) {
            return "string" != typeof i || i.match(/^[\-0-9\.]+$/) ? "" + i + units : i;
        }
        // ### toMS(duration)
        // Converts given `duration` to a millisecond string.
        //
        // toMS('fast') => $.fx.speeds[i] => "200ms"
        // toMS('normal') //=> $.fx.speeds._default => "400ms"
        // toMS(10) //=> '10ms'
        // toMS('100ms') //=> '100ms'  
        //
        function toMS(duration) {
            var i = duration;
            // Allow string durations like 'fast' and 'slow', without overriding numeric values.
            return "string" != typeof i || i.match(/^[\-0-9\.]+/) || (i = $.fx.speeds[i] || $.fx.speeds._default), 
            unit(i, "ms");
        }
        $.transit = {
            version: "0.9.9",
            // Map of $.css() keys to values for 'transitionProperty'.
            // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
            propertyMap: {
                marginLeft: "margin",
                marginRight: "margin",
                marginBottom: "margin",
                marginTop: "margin",
                paddingLeft: "padding",
                paddingRight: "padding",
                paddingBottom: "padding",
                paddingTop: "padding"
            },
            // Will simply transition "instantly" if false
            enabled: !0,
            // Set this to false if you don't want to use the transition end property.
            useTransitionEnd: !1
        };
        var div = document.createElement("div"), support = {}, isChrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
        // Check for the browser's transitions support.
        support.transition = getVendorPropertyName("transition"), support.transitionDelay = getVendorPropertyName("transitionDelay"), 
        support.transform = getVendorPropertyName("transform"), support.transformOrigin = getVendorPropertyName("transformOrigin"), 
        support.filter = getVendorPropertyName("Filter"), support.transform3d = checkTransform3dSupport();
        var eventNames = {
            transition: "transitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd",
            WebkitTransition: "webkitTransitionEnd",
            msTransition: "MSTransitionEnd"
        }, transitionEnd = support.transitionEnd = eventNames[support.transition] || null;
        // Populate jQuery's `$.support` with the vendor prefixes we know.
        // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
        // we set $.support.transition to a string of the actual property name used.
        for (var key in support) support.hasOwnProperty(key) && "undefined" == typeof $.support[key] && ($.support[key] = support[key]);
        // Avoid memory leak in IE.
        div = null, // ## $.cssEase
        // List of easing aliases that you can use with `$.fn.transition`.
        $.cssEase = {
            _default: "ease",
            "in": "ease-in",
            out: "ease-out",
            "in-out": "ease-in-out",
            snap: "cubic-bezier(0,1,.5,1)",
            // Penner equations
            easeOutCubic: "cubic-bezier(.215,.61,.355,1)",
            easeInOutCubic: "cubic-bezier(.645,.045,.355,1)",
            easeInCirc: "cubic-bezier(.6,.04,.98,.335)",
            easeOutCirc: "cubic-bezier(.075,.82,.165,1)",
            easeInOutCirc: "cubic-bezier(.785,.135,.15,.86)",
            easeInExpo: "cubic-bezier(.95,.05,.795,.035)",
            easeOutExpo: "cubic-bezier(.19,1,.22,1)",
            easeInOutExpo: "cubic-bezier(1,0,0,1)",
            easeInQuad: "cubic-bezier(.55,.085,.68,.53)",
            easeOutQuad: "cubic-bezier(.25,.46,.45,.94)",
            easeInOutQuad: "cubic-bezier(.455,.03,.515,.955)",
            easeInQuart: "cubic-bezier(.895,.03,.685,.22)",
            easeOutQuart: "cubic-bezier(.165,.84,.44,1)",
            easeInOutQuart: "cubic-bezier(.77,0,.175,1)",
            easeInQuint: "cubic-bezier(.755,.05,.855,.06)",
            easeOutQuint: "cubic-bezier(.23,1,.32,1)",
            easeInOutQuint: "cubic-bezier(.86,0,.07,1)",
            easeInSine: "cubic-bezier(.47,0,.745,.715)",
            easeOutSine: "cubic-bezier(.39,.575,.565,1)",
            easeInOutSine: "cubic-bezier(.445,.05,.55,.95)",
            easeInBack: "cubic-bezier(.6,-.28,.735,.045)",
            easeOutBack: "cubic-bezier(.175, .885,.32,1.275)",
            easeInOutBack: "cubic-bezier(.68,-.55,.265,1.55)"
        }, // ## 'transform' CSS hook
        // Allows you to use the `transform` property in CSS.
        //
        //     $("#hello").css({ transform: "rotate(90deg)" });
        //
        //     $("#hello").css('transform');
        //     //=> { rotate: '90deg' }
        //
        $.cssHooks["transit:transform"] = {
            // The getter returns a `Transform` object.
            get: function(elem) {
                return $(elem).data("transform") || new Transform();
            },
            // The setter accepts a `Transform` object or a string.
            set: function(elem, v) {
                var value = v;
                value instanceof Transform || (value = new Transform(value)), // We've seen the 3D version of Scale() not work in Chrome when the
                // element being scaled extends outside of the viewport.  Thus, we're
                // forcing Chrome to not use the 3d transforms as well.  Not sure if
                // translate is affectede, but not risking it.  Detection code from
                // http://davidwalsh.name/detecting-google-chrome-javascript
                elem.style[support.transform] = "WebkitTransform" !== support.transform || isChrome ? value.toString() : value.toString(!0), 
                $(elem).data("transform", value);
            }
        }, // Add a CSS hook for `.css({ transform: '...' })`.
        // In jQuery 1.8+, this will intentionally override the default `transform`
        // CSS hook so it'll play well with Transit. (see issue #62)
        $.cssHooks.transform = {
            set: $.cssHooks["transit:transform"].set
        }, // ## 'filter' CSS hook
        // Allows you to use the `filter` property in CSS.
        //
        //     $("#hello").css({ filter: 'blur(10px)' });
        //
        $.cssHooks.filter = {
            get: function(elem) {
                return elem.style[support.filter];
            },
            set: function(elem, value) {
                elem.style[support.filter] = value;
            }
        }, // jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
        // be necessary.
        $.fn.jquery < "1.8" && (// ## 'transformOrigin' CSS hook
        // Allows the use for `transformOrigin` to define where scaling and rotation
        // is pivoted.
        //
        //     $("#hello").css({ transformOrigin: '0 0' });
        //
        $.cssHooks.transformOrigin = {
            get: function(elem) {
                return elem.style[support.transformOrigin];
            },
            set: function(elem, value) {
                elem.style[support.transformOrigin] = value;
            }
        }, // ## 'transition' CSS hook
        // Allows you to use the `transition` property in CSS.
        //
        //     $("#hello").css({ transition: 'all 0 ease 0' });
        //
        $.cssHooks.transition = {
            get: function(elem) {
                return elem.style[support.transition];
            },
            set: function(elem, value) {
                elem.style[support.transition] = value;
            }
        }), // ## Other CSS hooks
        // Allows you to rotate, scale and translate.
        registerCssHook("scale"), registerCssHook("translate"), registerCssHook("rotate"), 
        registerCssHook("rotateX"), registerCssHook("rotateY"), registerCssHook("rotate3d"), 
        registerCssHook("perspective"), registerCssHook("skewX"), registerCssHook("skewY"), 
        registerCssHook("x", !0), registerCssHook("y", !0), Transform.prototype = {
            // ### setFromString()
            // Sets a property from a string.
            //
            //     t.setFromString('scale', '2,4');
            //     // Same as set('scale', '2', '4');
            //
            setFromString: function(prop, val) {
                var args = "string" == typeof val ? val.split(",") : val.constructor === Array ? val : [ val ];
                args.unshift(prop), Transform.prototype.set.apply(this, args);
            },
            // ### set()
            // Sets a property.
            //
            //     t.set('scale', 2, 4);
            //
            set: function(prop) {
                var args = Array.prototype.slice.apply(arguments, [ 1 ]);
                this.setter[prop] ? this.setter[prop].apply(this, args) : this[prop] = args.join(",");
            },
            get: function(prop) {
                return this.getter[prop] ? this.getter[prop].apply(this) : this[prop] || 0;
            },
            setter: {
                // ### rotate
                //
                //     .css({ rotate: 30 })
                //     .css({ rotate: "30" })
                //     .css({ rotate: "30deg" })
                //     .css({ rotate: "30deg" })
                //
                rotate: function(theta) {
                    this.rotate = unit(theta, "deg");
                },
                rotateX: function(theta) {
                    this.rotateX = unit(theta, "deg");
                },
                rotateY: function(theta) {
                    this.rotateY = unit(theta, "deg");
                },
                // ### scale
                //
                //     .css({ scale: 9 })      //=> "scale(9,9)"
                //     .css({ scale: '3,2' })  //=> "scale(3,2)"
                //
                scale: function(x, y) {
                    void 0 === y && (y = x), this.scale = x + "," + y;
                },
                // ### skewX + skewY
                skewX: function(x) {
                    this.skewX = unit(x, "deg");
                },
                skewY: function(y) {
                    this.skewY = unit(y, "deg");
                },
                // ### perspectvie
                perspective: function(dist) {
                    this.perspective = unit(dist, "px");
                },
                // ### x / y
                // Translations. Notice how this keeps the other value.
                //
                //     .css({ x: 4 })       //=> "translate(4px, 0)"
                //     .css({ y: 10 })      //=> "translate(4px, 10px)"
                //
                x: function(x) {
                    this.set("translate", x, null);
                },
                y: function(y) {
                    this.set("translate", null, y);
                },
                // ### translate
                // Notice how this keeps the other value.
                //
                //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
                //
                translate: function(x, y) {
                    void 0 === this._translateX && (this._translateX = 0), void 0 === this._translateY && (this._translateY = 0), 
                    null !== x && void 0 !== x && (this._translateX = unit(x, "px")), null !== y && void 0 !== y && (this._translateY = unit(y, "px")), 
                    this.translate = this._translateX + "," + this._translateY;
                }
            },
            getter: {
                x: function() {
                    return this._translateX || 0;
                },
                y: function() {
                    return this._translateY || 0;
                },
                scale: function() {
                    var s = (this.scale || "1,1").split(",");
                    // "2.5,2.5" => 2.5
                    // "2.5,1" => [2.5,1]
                    return s[0] && (s[0] = parseFloat(s[0])), s[1] && (s[1] = parseFloat(s[1])), s[0] === s[1] ? s[0] : s;
                },
                rotate3d: function() {
                    for (var s = (this.rotate3d || "0,0,0,0deg").split(","), i = 0; 3 >= i; ++i) s[i] && (s[i] = parseFloat(s[i]));
                    return s[3] && (s[3] = unit(s[3], "deg")), s;
                }
            },
            // ### parse()
            // Parses from a string. Called on constructor.
            parse: function(str) {
                var self = this;
                str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
                    self.setFromString(prop, val);
                });
            },
            // ### toString()
            // Converts to a `transition` CSS property string. If `use3d` is given,
            // it converts to a `-webkit-transition` CSS property string instead.
            toString: function(use3d) {
                var re = [];
                for (var i in this) if (this.hasOwnProperty(i)) {
                    // Don't use 3D transformations if the browser can't support it.
                    if (!support.transform3d && ("rotateX" === i || "rotateY" === i || "perspective" === i || "transformOrigin" === i)) continue;
                    "_" !== i[0] && re.push(use3d && "scale" === i ? i + "3d(" + this[i] + ",1)" : use3d && "translate" === i ? i + "3d(" + this[i] + ",0)" : i + "(" + this[i] + ")");
                }
                return re.join(" ");
            }
        }, // ## $.fn.transition
        // Works like $.fn.animate(), but uses CSS transitions.
        //
        //     $("...").transition({ opacity: 0.1, scale: 0.3 });
        //
        //     // Specific duration
        //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
        //
        //     // With duration and easing
        //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
        //
        //     // With callback
        //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
        //
        //     // With everything
        //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
        //
        //     // Alternate syntax
        //     $("...").transition({
        //       opacity: 0.1,
        //       duration: 200,
        //       delay: 40,
        //       easing: 'in',
        //       complete: function() { /* ... */ }
        //      });
        //
        $.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
            var self = this, delay = 0, queue = !0, theseProperties = jQuery.extend(!0, {}, properties);
            // Account for `.transition(properties, callback)`.
            "function" == typeof duration && (callback = duration, duration = void 0), // Account for `.transition(properties, options)`.
            "object" == typeof duration && (easing = duration.easing, delay = duration.delay || 0, 
            queue = duration.queue || !0, callback = duration.complete, duration = duration.duration), 
            // Account for `.transition(properties, duration, callback)`.
            "function" == typeof easing && (callback = easing, easing = void 0), // Alternate syntax.
            "undefined" != typeof theseProperties.easing && (easing = theseProperties.easing, 
            delete theseProperties.easing), "undefined" != typeof theseProperties.duration && (duration = theseProperties.duration, 
            delete theseProperties.duration), "undefined" != typeof theseProperties.complete && (callback = theseProperties.complete, 
            delete theseProperties.complete), "undefined" != typeof theseProperties.queue && (queue = theseProperties.queue, 
            delete theseProperties.queue), "undefined" != typeof theseProperties.delay && (delay = theseProperties.delay, 
            delete theseProperties.delay), // Set defaults. (`400` duration, `ease` easing)
            "undefined" == typeof duration && (duration = $.fx.speeds._default), "undefined" == typeof easing && (easing = $.cssEase._default), 
            duration = toMS(duration);
            // Build the `transition` property.
            var transitionValue = getTransition(theseProperties, duration, easing, delay), work = $.transit.enabled && support.transition, i = work ? parseInt(duration, 10) + parseInt(delay, 10) : 0;
            // If there's nothing to do...
            if (0 === i) {
                var fn = function(next) {
                    self.css(theseProperties), callback && callback.apply(self), next && next();
                };
                return callOrQueue(self, queue, fn), self;
            }
            // Save the old transitions of each element so we can restore it later.
            var oldTransitions = {}, run = function(nextCall) {
                var bound = !1, cb = function() {
                    bound && self.unbind(transitionEnd, cb), i > 0 && self.each(function() {
                        this.style[support.transition] = oldTransitions[this] || null;
                    }), "function" == typeof callback && callback.apply(self), "function" == typeof nextCall && nextCall();
                };
                i > 0 && transitionEnd && $.transit.useTransitionEnd ? (// Use the 'transitionend' event if it's available.
                bound = !0, self.bind(transitionEnd, cb)) : // Fallback to timers if the 'transitionend' event isn't supported.
                window.setTimeout(cb, i), // Apply transitions.
                self.each(function() {
                    i > 0 && (this.style[support.transition] = transitionValue), $(this).css(properties);
                });
            }, deferredRun = function(next) {
                this.offsetWidth, // force a repaint
                run(next);
            };
            // Chainability.
            // Use jQuery's fx queue.
            return callOrQueue(self, queue, deferredRun), this;
        }, // Export some functions for testable-ness.
        $.transit.getTransitionValue = getTransition, $.transit.Transform = Transform;
    }(jQuery);
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
            }), //console.log({x: "+=" + (-params.direction * leftShift), y: "+=" + (-params.direction * topShift)});
            $(elem).transit({
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
        container.appendTo(outerContainer), this.outerContainer = $(outerContainer), this.outerContainer.attr("tabindex", 1), 
        this.innerContainer = container, //Place all floaters in the centre of the screen using
        container.find(".floater").each(function() {
            var left = ($this.containerWidth - $(this).width()) / 2, top = ($this.containerHeight - $(this).height()) / 2, options = $(this).getDOMOptions(presentationObjectOptions);
            $(this).css({
                top: top,
                left: left
            });
            for (var i in validTransforms) options[validTransforms[i]] && $(this).css(validTransforms[i], options[validTransforms[i]]);
        }), options.letterbox && (console.log(options), $(this.outerContainer).addClass("letterbox"));
        var addChildren = function() {
            var options = $(this).getDOMOptions(presentationObjectOptions), elem = $(this);
            //Is there a need to differentiate between entrance/exit animations and modifyer animations?
            //For the time being, one can just use data-exit to stop modifyer animations from being executed on childrenExit
            if (options.anim && (elem.css("opacity", 0), options.anim.params = $.extend({}, {
                direction: 1,
                duration: 500,
                easing: "in-out"
            }, options.anim.params), options.anim.depth = elem.parents().length - $this.depth, 
            /*if (elem.children(".notes")) {
                options.anim.notes = elem.children(".notes");
                elem.remove(".notes");
            }*/
            animationQueue.push(options.anim)), options.animChildrenStep && $(this).children().each(function(key, val) {
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
        this.innerContainer.children().each(addChildren), $(this.outerContainer).keydown(function(e) {
            //39 is right, 37 is left
            (39 === e.which || 37 === e.which) && $this.proceed(37 === e.which);
        }), $(this.outerContainer).click(function() {
            $this.proceed();
        }), this.presenterView = null, // Opens up a window in presenter view and fires a function at it when it's ready
        this.openPresenterView = function(url, callback) {
            return $this.presenterView = window.open(url, "Presenter" + location.href), $($this.presenterView.document).ready(function() {
                $this.presenterView.ready($this), callback && callback($this.presenterView);
            }), $this.presenterView;
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
            //$this.trigger("animateStart", {});
            $this.index in animationQueue && "withprevious" === animationQueue[$this.index].start ? (fun.run($this, reverse, extender), 
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
                        console.log(parsed[1]);
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
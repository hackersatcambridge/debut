/*! oliver-and-swan 2014-02-18 */
!function(exports, global) {
    function Animation(fun, params) {
        this.params = $.extend({
            easing: "easeInOutCubic"
        }, params), this.fun = fun, //Valid values for start are onstep, withprevious and afterprevious
        this.start = "onstep", this.delay = 0, this._elem = null, this.domClone = null, 
        this.run = function(context, reverse) {
            reverse || this.domClone || (this.domClone = $(this._elem).clone(), this.params.domClone = this.domClone);
            var nparams = this.params;
            reverse && (nparams = $.extend({}, this.params, {
                direction: -this.params.direction,
                domClone: this.domClone
            })), this.fun(this._elem, context, nparams, function() {});
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
        slide: function(elem, context, params) {
            //This animation has the object slide in (or out) from a particular side of the screen
            var leftShift = 0, topShift = 0;
            params = $.extend({
                side: "left"
            }, params), //Resets the object to its original position if going forwards
            //TODO: measure some sort of initial state and use this in case the object already uses translate x and y
            1 === params.direction && params.domClone && (console.log("Reverseidom", params.domClone), 
            $(elem).css({
                x: $(params.domClone).css("x"),
                y: $(params.domClone).css("y")
            })), $(elem).css("opacity", 1);
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
            }, params.duration, params.easing, params.callback);
        },
        slideTo: function(elem, context, params) {
            var toGo = {};
            1 === params.direction ? (params.x && (toGo.x = params.x), params.y && (toGo.y = params.y)) : (toGo.x = $(params.domClone).css("x"), 
            toGo.y = $(params.domClone).css("y")), $(elem).transit(toGo, params.duration, params.easing, params.callback);
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
    } ], animationQueue = [], OliverAndSwan = function(outerContainer, options) {
        this.innerContainer = null, this.outerContainer = null, this.index = 0;
        //TODO: Put all of this into the OliverAndSwan object
        var masterWidth, masterHeight, container = $('<div class="presentation-container"></div>'), slideMaster = outerContainer, domOptions = $(outerContainer).getDOMOptions(slideMasterOptions), $this = this;
        $(outerContainer).addClass("presentation-master"), options = $.extend({}, domOptions, options), 
        this.containerHeight = options.containerHeight, this.containerWidth = this.containerHeight * options.aspectRatio, 
        this.scale = 1, container.height(this.containerHeight), container.width(this.containerWidth), 
        container.css("transform-origin", "0 0"), this.containerLeft = 0, this.containerTop = 0, 
        this.resize = function() {
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
        options.letterbox && (console.log(options), $(this.outerContainer).addClass("letterbox"));
        var addChildren = function() {
            var options = $(this).getDOMOptions(presentationObjectOptions), elem = $(this);
            //Is there a need to differentiate between entrance/exit animations and modifyer animations?
            //For the time being, one can just use data-exit to stop modifyer animations from being executed on childrenExit
            if (options.anim && (elem.css("opacity", 0), options.anim.params = $.extend({}, {
                direction: 1,
                duration: 500,
                easing: "in-out"
            }, options.anim.params), animationQueue.push(options.anim)), options.animChildrenStep && $(this).children().each(function(key, val) {
                (void 0 === $(val).attr("data-anim") || $(val).attr("data-anim") === !1) && $(val).attr("data-anim", elem.attr("data-anim-children-step"));
            }), $(this).children().each(addChildren), options.endExitChildren) {
                $(this).children().each(function(key, val) {
                    childrenExit(val, !0);
                });
            } else options.endExit && (options.endExit.params = $.extend({}, {
                direction: -1,
                duration: 500,
                easing: "in-out"
            }, options.endExit.params), animationQueue.push(options.endExit));
        }, childrenExit = function(elem) {
            var options = $(elem).getDOMOptions(presentationObjectOptions);
            elem = $(elem), options.anim && !options.exit && (options.exit = $.extend(!0, new Animation(), options.anim)), 
            options.exit && (options.exit.params = $.extend({}, {
                direction: -1,
                duration: 500,
                easing: "in-out"
            }, options.exit.params), options.exit._elem = elem, options.exit.start = 0 !== elem.index() ? "withprevious" : "onstep", 
            animationQueue.push(options.exit));
        };
        this.innerContainer.children().each(addChildren), $(window).keydown(function(e) {
            //39 is right, 37 is left
            (39 === e.which || 37 === e.which) && $this.proceed(37 === e.which);
        }), $(this.outerContainer).click(function() {
            $this.proceed();
        }), this.proceed = function(reverse) {
            var fun, type;
            if (reverse = !!reverse) {
                if ($this.index <= 0) return;
                $this.index -= 1;
            } else if ($this.index >= animationQueue.length) return;
            fun = animationQueue[$this.index], type = fun.constructor.name, fun.run($this, reverse), 
            reverse || ($this.index += 1), //nextind = $this.index + reverse ? -1 : 0;
            $this.index in animationQueue && "withprevious" === animationQueue[$this.index].start && (0 === fun.delay ? $this.proceed(reverse) : setTimeout(function() {
                $this.proceed(reverse);
            }, fun.delay));
        };
    };
    //Returns an object based on a DOM elements data attributes that match the template
    $.fn.getDOMOptions = function(template) {
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
        return options;
    }, //Where all the magic happpens
    $.fn.present = function(options) {
        new OliverAndSwan($(this), options);
    }, //Make the OliverAndSwan object global
    $.OliverAndSwan = OliverAndSwan, OliverAndSwan.animations = animations;
}({}, function() {
    return this;
}());
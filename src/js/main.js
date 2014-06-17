/* jshint browser:true */
/* jshint -W086 */
/* global jQuery:false */
/* global console:false */

//Settings for the object that contains the presentation
var slideMasterOptions = [
    {
        key: "letterbox",
        type: "boolean",
        default: false
    },
    {
        key: "aspect-ratio",
        type: function (val) {
            // Takes a string, such as 4:3 and then converts it into a decimal ratio (4/3 ~= 1.33333)
            var arr = val.split(":");
            return parseFloat(arr[0]) / parseFloat(arr[1]);
        },
        default: 16 / 9
    },
    {
        key: "container-height",
        type: "number",
        default: 500
    },
    {
        key: "canvas-upscale",
        type: "number",
        default: 4
    }
];
//Settings for objects in the presentation
var presentationObjectOptions = [
    {
        key: "anim",
        type: "animation",
        default: null
    },
    {
        key: "end-exit-children",
        type: "boolean",
        default: false
    },
    {
        key: "end-exit",
        type: "animation",
        default: null
    },
    {
        key: "anim-children-step",
        type: "animation",
        default: null
    }
];
//Valide properties to put in data options for transforming the element
var validTransforms = ['x','y','z','rotate','rotate-x','rotate-y','scale','scale-x','scale-y'];
for (var i in validTransforms) {
    presentationObjectOptions.push({
        key: validTransforms[i],
        type: "string",
        default: null
    });
    validTransforms[i] = toCamelCase(validTransforms[i]);
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var OliverAndSwan = function(outerContainer, options) {
    this.innerContainer = null;
    this.outerContainer = null;
    this.index = 0;
    this.milestones = [];
    this.events = {};
    var animationQueue = this.animationQueue = [];
    
    //TODO: Clean up this mess
    var container = $('<div class="presentation-container"></div>'),
        slideMaster = outerContainer,
        domOptions = $(outerContainer).getDOMOptions(slideMasterOptions),
        containerHeight,
        containerWidth,
        i, masterWidth, masterHeight, $this = this;
    $(outerContainer).addClass("presentation-master");
    options = $.extend({ }, domOptions, options);
    this.options = options;
    this.containerHeight = options.containerHeight;
    this.containerWidth = this.containerHeight * options.aspectRatio;
    this.scale = 1;
    container.height(this.containerHeight);
    container.width(this.containerWidth);
    container.css("transform-origin", "0 0");
    this.containerLeft = 0;
    this.containerTop = 0;
    this.depth = container.parents().length;
    
    
    this.resize = function(e) {
        var ratio, scale;
        if ((slideMaster.width() != masterWidth) || (slideMaster.height() != masterHeight)) {
            masterWidth = slideMaster.width();
            masterHeight = slideMaster.height();
            ratio = masterWidth / masterHeight;
            //If the viewport is wider, scale according to height
            if (ratio > options.aspectRatio) {
                $this.scale = masterHeight / $this.containerHeight;
                $this.containerLeft = (masterWidth - $this.scale * $this.containerWidth) / 2;
                $this.containerTop = 0;
            } else {
                $this.scale = masterWidth / $this.containerWidth;
                $this.containerLeft = 0;
                $this.containerTop = (masterHeight - $this.scale * $this.containerHeight) / 2;
            }
            
            container.css({left: $this.containerLeft, top: $this.containerTop});
            container.css("scale", $this.scale);
        }
    }
    
    $(window).resize(this.resize);
    this.resize();
    
    $(outerContainer).children("*").appendTo(container);
    container.appendTo(outerContainer);
    
    this.outerContainer = $(outerContainer);
    this.innerContainer = container;
    
    // Scale the canvases by the canvas scale factor
    // If it is not a floater, it will scale by the top left
    // If it is, it will scale by the centre
    container.find("canvas").each(function() {
        var options = $(this).getDOMOptions([{
            key: "upscale",
            type: "number",
            default: $this.options.canvasUpscale
        }]);
        
        var width = $(this).width(), height = $(this).height();
        
        $(this).attr("width", width * options.upscale);
        $(this).attr("height", height * options.upscale);
        
        $(this).css({width: width, height: height});
    });
    
    //Place all floaters in the centre of the screen using left and top
    // Would much rather use a combination of translate and translate3d
    // But this cannot be done until a fix for Webkit's gross 3D rendering is found
    container.find(".floater").each(function() {
        //Width is slightly off for every element
        var left = ($this.containerWidth - $(this).width()) / 2,
            top = ($this.containerHeight - $(this).height()) / 2,
            options = $(this).getDOMOptions(presentationObjectOptions);
        $(this).css({top: top, left: left});
        
        for(var i in validTransforms) {
            if (options[validTransforms[i]]) {
                $(this).css(validTransforms[i], options[validTransforms[i]]);
            }
        }
    });
    
    
    
    
    if (options.letterbox) {
        $(this.outerContainer).addClass("letterbox");
    }
    
    
    
    var addChildren = function() {
        var options = $(this).getDOMOptions(presentationObjectOptions), elem = $(this);
        if (options.anim) {
            if (!options.anim.params.nohide) elem.css('opacity', 0);
            options.anim.params = $.extend({}, {direction: 1, duration: 500, easing: "in-out"}, options.anim.params);
            options.anim.depth = elem.parents().length - $this.depth;
            if (elem.children(".notes").length) {
                options.anim.notes = elem.children(".notes");
                elem.children(".notes").remove();
            }
            if (options.anim.params.milestone) {
                $this.milestones.push({ind: animationQueue.length, name: options.anim.params.milestone});
            }
            
            
            animationQueue.push(options.anim);
        }
        
        if (options.animChildrenStep) {
            
            $(this).children().each(function(key, val) {
                
                if (($(val).attr("data-anim") === undefined) || ($(val).attr("data-anim") === false)) {
                    $(val).attr("data-anim", elem.attr("data-anim-children-step"));
                }
            });
        }
        
        $(this).children().each(addChildren);
        
        //Is there a need to differentiate between entrance/exit animations and modifyer animations?
        //For the time being, one can just use data-exit to stop modifyer animations from being executed on childrenExit
        if (options.endExitChildren) {
            var queue = [];
            $(this).children().each(function(key, val) {
                childrenExit(val, true);
            });
            //animationQueue.push(queue);
        } else if (options.endExit) {
            options.endExit.params = $.extend({}, {direction: -1, duration: 500, easing: "in-out"}, options.endExit.params);
            options.endExit.depth = elem.parents().length - $this.depth;
            if ((elem.children(".notes").length) && (!options.anim)) {
                options.endExit.notes = elem.children(".notes");
                elem.children(".notes").remove();
            }
            if (options.endExit.params.milestone) {
                $this.milestones.push({ind: animationQueue.length, name: options.endExit.params.milestone});
            }
            animationQueue.push(options.endExit);
        }
    }, childrenExit = function(elem, top) {
        var options = $(elem).getDOMOptions(presentationObjectOptions);
        elem = $(elem);
        if ((options.anim) && (!options.exit)) {
            options.exit = $.extend(true, new Animation(), options.anim);
        }
        if (options.exit) {
            options.exit.params = $.extend({}, {direction: -1, duration: 500, easing: "in-out"}, options.exit.params);
            options.exit._elem = elem;
            options.exit.start = elem.index() !== 0 ? "withprevious" : "onstep";
            options.exit.depth = elem.parents().length - $this.depth;
            animationQueue.push(options.exit);
        }
        /*$(this).children().each(function(key, val) {
            childrenExit(val, false);
        });*/
    };
    this.innerContainer.children().each(addChildren);
    $(window).keydown(function(e) {
        //39 is right, 37 is left
        
        if ((e.which === 39) || (e.which === 37)) {
            $this.proceed(e.which === 37);
        }
        
    });
    
    $(this.outerContainer).click(function(e) {
        $this.proceed();
    });
    
    window.onbeforeunload = (function(e) {
        if ($this.presenterView) {
            $this.presenterView.close();
        }
    });
    
    
    this.presenterView = null;
    // Opens up a window in presenter view and fires a function at it when it's ready
    this.openPresenterView = function(url, callback) {
        if ($this.presenterView) {
            $this.presenterView.close();
        }
        
        $this.presenterView = window.open(url, "Presenter");
        $($this.presenterView).load(function() {
            $this.presenterView.ready($this);
            if (callback) callback($this.presenterView);
        });
        $this.presenterView.onbeforeunload = (function() {
            $this.presenterView = null;
        });
        return $this.presenterView;
    };
    
    // Binds an function to an event
    this.on = function(event, callback) {
        if (!$this.events[event]) {
            $this.events[event] = [];
        }
        $this.events[event].push(callback);
    }
    
    // Triggers an event
    this.trigger = function(event, data) {
        if (!$this.events[event]) {
            $this.events[event] = [];
        }
        var i = 0, trigger;
        while(trigger = $this.events[event][i++]) {
            trigger(data);
        }
    }
    
    // Method for jumping to a point in the presentation (by index)
    // Will do smooth animations until at lowermost required depth
    // Will then skip animations and then do smooth animations back up
    this.goTo = function(index) {
        var reverse = index < $this.index, direction = reverse ? -1 : 1, animation;
        if (index === $this.index) return;
        
        //Find when the next valid "stopping point is" in front of the passed index
        while ((animationQueue[index]) && (animationQueue[index].start != "onstep")) {
            index ++;
        }
        
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
            if (((reverse) && ($this.index <= index)) || ((!reverse) && ($this.index >= index))) {
                //Do we need to do anything here?
            } else {
                $this.proceed(reverse, true, proceed);
            }
        }
        
        proceed();
    };
    
    this.proceed = function(reverse, quick, callback) {
        var fun, type, nextind;
        
        reverse = !!reverse;
        
        if (reverse) {
            if ($this.index <= 0) {
                return;
            }
            $this.index -= 1;
        } else if ($this.index >= animationQueue.length) {
            return;
        }
        
        fun = animationQueue[$this.index];
        type = fun.constructor.name;
        var extender = {};
        if (quick) {
            extender.duration = 0;
        }
        
        
        if (!reverse) {
            $this.index += 1;
        }
        
        //nextind = $this.index + reverse ? -1 : 0;
        $this.trigger("animateStart", {});
        if (($this.index in animationQueue) && (animationQueue[$this.index].start === "withprevious")) {
            fun.run($this, reverse, extender);
            if (((fun.delay === 0) && (reverse)) || ((animationQueue[$this.index].delay === 0) && (!reverse)) || (quick)) {
                $this.proceed(reverse, quick, callback);
            } else {
                setTimeout(function() { $this.proceed(reverse, quick, callback) }, reverse ? fun.delay : animationQueue[$this.index].delay);
            }
        } else {
            
            fun.run($this, reverse, extender, callback || undefined);
        }
        
        
    }
    
    var lastTime = 0;
    this.animationFrame = function(time) {
        if (lastTime === 0) lastTime = time;
        $this.trigger("animationFrame", time - lastTime);
        lastTime = time;
        requestAnimationFrame($this.animationFrame);
    };
    requestAnimationFrame(this.animationFrame);
    
};

// Takes a string seperated by hyphens (default) and converts it to camel case
function toCamelCase(str, seperator) {
    if (typeof seperator === "undefined") {
        seperator = "-";
    }
    return str.split(seperator).map(function (e, i) {
        if (i === 0) {
            return e.charAt(0).toLowerCase() + e.slice(1);
        } else {
            return e.charAt(0).toUpperCase() + e.slice(1);
        }
    }).join("");
}

//Returns an object based on a DOM elements data attributes that match the template
$.fn.getDOMOptions = function (template) {
    //if ($(this).data("domOptions")) return $(this).data("domOptions");
    var i, attr, type, key, val,
        options = { };
    for (i in template) {
        key = toCamelCase(template[i].key);
        attr = this.attr("data-" + template[i].key);
        if (typeof attr !== "undefined") {
            type = template[i].type;
            switch (typeof type) {
                //Is type a predefined value?
                case "string":
                    switch (type) {
                        //Booleans will be true if the string evaluates to true or if no value is specified
                        case "boolean":
                            options[key] = false;
                            if ((attr) || (attr === "")) {
                                options[key] = true;
                            }
                            break;
                        //Numbers will be parsed as floats. If it can't be parsed, the value is not set
                        case "number":
                        case "float":
                            val = parseFloat(attr);
                            if (!isNaN(val)) {
                                options[key] = val;
                            } else if (attr === "") {
                                options[key] = 0;
                            }
                            break;
                        //Animation allows you to set attributes in JSON format
                        case "animation":
                            var anim = attr, parsed = attr ? attr.match(/([^{]+){([\s\S]+)/m) : null, params = {};
                            //TODO: Allow the passing of parameters to inline animations
                            if (parsed) {
                                //There really isn't any risk of using eval when it's the source code of a page being eval'd
                                //If you don't like it, tell me about a better alternative
                                params = eval('({' + parsed[2] + ')');
                                anim = parsed[1];
                            } else {
                            //Checking if there is inline JS code in there
                                parsed = attr ? attr.match(/^{([\s\S]*)}$/m) : null;
                                if (parsed) {
                                    //Save the inline code in a function so it is already parsed but not executed
                                    //This saves processing time when actually running the animation
                                    var fun = eval('(function(elem,context,params,callback) {' + parsed[1] + '})');
                                    options[key] = new Animation(fun, params);
                                    break;
                                }
                            }
                            if (!(anim in animations)) {
                                options[key] = new Animation(animations.appear, params);
                            } else {
                                options[key] = new Animation(animations[anim], params);
                            }
                            options[key]._elem = $(this);
                            if (params.start) {
                                options[key].start = params.start;
                            }
                            if (params.on) {
                                options[key]._elem = $(params.on);
                            }
                            if (params.delay) {
                                options[key].delay = params.delay;
                            }
                            break;
                        //If it's a string, just set it directly (is also the default type)
                        case "string":
                        default:
                            options[key] = attr;
                            break;
                    }
                    break;
                //Is it a function that will convert the string into the real value?
                case "function":
                    val = type(attr);
                    
                    if (typeof val !== "undefined") {
                        options[key] = val;
                    }
                    break;
                //If we don't know, just assume it's a string
                default:
                    options[key] = attr;
                    break;
            }
        }
        //If the object still hasn't got a value, pull the default one
        if (!options.hasOwnProperty(key)) {
            options[key] = template[i].default;
        }
    }
    $(this).data("domOptions", options);
    return options;
};

//Where all the magic happpens
$.fn.present = function (options) {
    return new OliverAndSwan($(this), options);
};

//Make the OliverAndSwan object global
$.OliverAndSwan = OliverAndSwan;
OliverAndSwan.animations = animations;


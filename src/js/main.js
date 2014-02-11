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
        default: 16/9
    },
    {
        key: "container-height",
        type: "number",
        default: 500
    }
//Settings for objects in the presentation
];
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
], animationQueue = [];


var OliverAndSwan = function(outerContainer, options) {
    this.innerContainer = null;
    this.outerContainer = null;
    this.index = 0;
    
    
    //TODO: Put all of this into the OliverAndSwan object
    var container = $('<div class="presentation-container"></div>'),
        slideMaster = outerContainer,
        domOptions = $(outerContainer).getDOMOptions(slideMasterOptions),
        containerHeight,
        containerWidth,
        i, masterWidth, masterHeight, $this = this;
    $(outerContainer).addClass("presentation-master");
    options = $.extend({ }, domOptions, options);
    
    this.containerHeight = options.containerHeight;
    this.containerWidth = this.containerHeight * options.aspectRatio;
    this.scale = 1;
    container.height(this.containerHeight);
    container.width(this.containerWidth);
    container.css("transform-origin", "0 0");
    this.containerLeft = 0;
    this.containerTop = 0;
    
    
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
    
    
    if (options.letterbox) {
        console.log(options);
        $(this.outerContainer).addClass("letterbox");
    }
    
    var addChildren = function() {
        var options = $(this).getDOMOptions(presentationObjectOptions), elem = $(this);
        if (options.anim) {
            elem.css('opacity', 0);
            options.anim.params = $.extend({}, {direction: 1, duration: 500, easing: "in-out"}, options.anim.params);
            options.anim._elem = elem;
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
        
        if (options.endExitChildren) {
            var queue = [];
            $(this).children().each(function(key, val) {
                childrenExit(val, true);
            });
            //animationQueue.push(queue);
        } else if (options.endExit) {
            options.endExit.params = $.extend({}, {direction: -1, duration: 500, easing: "in-out"}, options.endExit.params);
            options.endExit._elem = elem;
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
    
    this.proceed = function(reverse) {
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
        fun.run($this, reverse);
        
        if (!reverse) {
            $this.index += 1;
        }
        
        //nextind = $this.index + reverse ? -1 : 0;
        
        if (($this.index in animationQueue) && (animationQueue[$this.index].start === "withprevious")) {
            if (fun.delay === 0) {
                $this.proceed(reverse);
            } else {
                setTimeout(function() { $this.proceed(reverse) }, fun.delay);
            }
        }
        
        
    }
    
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
                                    console.log(parsed[1]);
                                    var fun = eval('(function(elem,context,params,callback) {' + parsed[1] + '})');
                                    options[key] = new Animation(fun, params);
                                    break;
                                }
                            }
                            if (!(anim in animations)) {
                                options[key] = new Animation(animations.appear, params);
                            } else {
                                options[key] = new Animation(animations[anim], params);
                                if (params.start) {
                                    options[key].start = params.start;
                                }
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
    return options;
};

//Where all the magic happpens
$.fn.present = function (options) {
    new OliverAndSwan($(this), options);
};


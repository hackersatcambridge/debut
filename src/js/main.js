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
    }
], animationQueue = [];


var OliverAndSwan = function() {
    this.innerContainer = null;
    this.outerContainer = null;
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
        console.log(key + ": " + attr);
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
                            var anim = attr, parsed = attr ? attr.match(/([^{]*){(.+)/) : null, params = {};
                            if (parsed) {
                                params = eval('({' + parsed[2] + ')');
                                anim = parsed[1];
                            }
                            if (!(anim in animations)) {
                                options[key] = new Animation(animations.appear, params);
                            } else {
                                options[key] = new Animation(animations[anim], params);
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
    //TODO: Put all of this into the OliverAndSwan object
    var container = $('<div class="presentation-container"></div>'),
        slideMaster = this,
        domOptions = this.getDOMOptions(slideMasterOptions),
        containerHeight,
        containerWidth,
        i, masterWidth, masterHeight,
        context = new OliverAndSwan();
    this.addClass("slide-master");
    options = $.extend({ }, domOptions, options);
    
    containerHeight = options.containerHeight;
    containerWidth = containerHeight * options.aspectRatio;
    container.height(containerHeight);
    container.width(containerWidth);
    container.css("transform-origin", "0 0");
    
    $(window).resize(function(e) {
        var ratio, scale;
        if ((slideMaster.width() != masterWidth) || (slideMaster.height() != masterHeight)) {
            masterWidth = slideMaster.width();
            masterHeight = slideMaster.height();
            ratio = masterWidth / masterHeight;
            //If the viewport is wider, scale according to height
            if (ratio > options.aspectRatio) {
                scale = masterHeight / containerHeight;
                container.css({left: (masterWidth - scale * containerWidth) / 2, top: 0});
            } else {
                scale = masterWidth / containerWidth;
                container.css({left: 0, top: (masterHeight - scale * containerHeight) / 2});
            }
            
            container.css("scale", scale);
        }
    });
    
    this.children("*").appendTo(container);
    container.appendTo(this);
    
    context.outerContainer = $(this);
    context.innerContainer = container;
    
    var addChildren = function() {
        var options = $(this).getDOMOptions(presentationObjectOptions), elem = $(this);
        if (options.anim) {
            elem.css('opacity', 0);
            options.anim.params = $.extend({}, {direction: 1, duration: 500, easing: "in-out"}, options.anim.params);
            options.anim._elem = elem;
            animationQueue.push(options.anim);
        }
        $(this).children().each(addChildren);
        if (options.endExitChildren) {
            var queue = [];
            $(this).children().each(function(key, val) {
                childrenExit(queue, val);
            });
            animationQueue.push(queue);
        } else if (options.endExit) {
            options.endExit.params = $.extend({}, {direction: -1, duration: 500, easing: "in-out"}, options.endExit.params);
            options.endExit._elem = elem;
            animationQueue.push(options.endExit);
        }
    }, childrenExit = function(queue, elem) {
        var options = $(elem).getDOMOptions(presentationObjectOptions);
        elem = $(elem);
        if ((options.anim) || (!options.exit)) {
            options.exit = $.extend(true, new Animation(), options.anim);
        }
        if (options.exit) {
            options.exit.params = $.extend({}, {direction: -1, duration: 500, easing: "in-out"}, options.exit.params);
            options.exit._elem = elem;
            queue.push(options.exit);
        }
        $(this).children().each(function(key, val) {
            childrenExit(queue, val);
        });
    }
    container.children().each(addChildren);
    var ind = 0;
    $(window).keydown(function(e) {
        //39 is right, 37 is left
        
        if ((e.which === 39) || (e.which === 37)) {
            var fun, type, reverse = (e.which === 37);
            if (reverse) {
                if (ind <= 0) {
                    return;
                }
                ind -= 1;
            } else if (ind >= animationQueue.length) {
                return;
            }
            fun = animationQueue[ind];
            type = fun.constructor.name;
            if (type === "Animation") {
                fun.run(context, reverse);
            } else if (type === "Array") {
                $(fun).each(function (key, val) {
                    val.run(context, reverse);
                });
            } else {
                //
                throw new Error("Unsupported animation type");
            }
            
            if (!reverse) {
                
                ind += 1;
            }
        }
        
    });
};


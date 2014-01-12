/* jshint browser:true */
/* jshint -W086 */
/* global jQuery:false */
/* global console:false */
(function ($) {
    'use strict';
    
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
    ],  presentationObjectOptions = [
        {
            key: "anim",
            type: function(val) {
                if (val === "") {
                    return animations.default;
                }
            },
            default: null
        }
    //Kinds of animation, for that beauty and stuff
    ],  animations = {
        default: {
            in: function(elem) {
                $(elem).css('visibility', 'visible');
            },
            out: function(elem) {
                $(elem).css('visibility', 'hidden');
            }
        }
    }, animationQueue = [];
    
    
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
        var container = $('<div class="presentation-container"></div>'),
            slideMaster = this,
            domOptions = this.getDOMOptions(slideMasterOptions),
            containerHeight,
            containerWidth,
            i, masterWidth, masterHeight;
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
        var addChildren = function() {
            var options = $(this).getDOMOptions(presentationObjectOptions), elem = $(this);
            if (options.anim) {
                elem.css('visibility', 'hidden');
                animationQueue.push(function() {
                    console.log(options.anim.in);
                    options.anim.in(elem);
                });
            }
            $(this).children().each(addChildren);
        }
        container.children().each(addChildren);
        $(window).keypress(function() {
            animationQueue.shift()();
        });
    };

}(jQuery));


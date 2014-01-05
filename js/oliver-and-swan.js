/* jshint browser:true */
/* jshint -W086 */
/* global jQuery:false */
(function ($) {
    'use strict';
    var slideMasterOptions = [
        {
            key: "letterbox",
            type: "boolean"
        }
    ];
    
    //Returns an object based on a DOM elements data attributes that match the template
    $.fn.getDOMOptions = function (template) {
        var i, attr, type, key, val,
            options = { };
        for (i in template) {
            key = template[i].key;
            attr = this.attr(key);
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
                        options[key] = type(attr);
                        break;
                    //If we don't know, just assume it's a string
                    default:
                        options[key] = attr;
                        break;
                }
            }
        }
    };
    
    $.fn.present = function (options) {
        var defaultOptions = { },
            container = $('<div class="presentation-container"></div>'),
            receivedOptions = { },
            i;
        //This little snippet checks if
        for (i in slideMasterOptions) {
            
        }
        options = $.extend({ }, options, defaultOptions);
        
        
        
        
        if (!options.hasOwnProperty("letterbox")) {
            options.letterbox = false;
            if ((this.data("letterbox")) || (this.data("letterbox") === "")) {
                options.letterbox = true;
            }
        }
        
        this.children("*").appendTo(container);
        container.appendTo(this);
    };
}(jQuery));
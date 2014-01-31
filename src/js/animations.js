var animations = {
    appear: function(elem, context, params, callback) {
        if (params.direction === 1) {
            $(elem).css('opacity', 1);
        } else if (params.direction === -1) {
            $(elem).css('opacity', 0);
        }
        callback();
    },
    slide: function(elem, context, params, callback) {
        //This animation has the object slide in (or out) from a particular side of the screen
        var leftShift = 0, topShift = 0;
        params = $.extend({side: "left"}, params);
        $(elem).css('opacity', 1);
        switch(params.side) {
            default:
            case "left":
                leftShift = -($(elem).width() + $(elem).offset().left - context.innerContainer.offset().left);
            break;
            case "right":
                leftShift = context.innerContainer.width() - ($(elem).offset().left - context.innerContainer.offset().left);
            break;
            case "top":
                topShift = -($(elem).height() + $(elem).offset().top - context.innerContainer.offset().top);
            break;
            case "bottom":
                topShift = context.innerContainer.height() - ($(elem).offset().top - context.innerContainer.offset().top);
            break;
        }
        
        if (params.direction === 1) {
            $(elem).css({"x": "+=" + (params.direction * leftShift), "y": "+=" + (params.direction * topShift)});
        }
        console.log({x: "+=" + (-params.direction * leftShift), y: "+=" + (-params.direction * topShift)});
        $(elem).transit({x: "+=" + (-params.direction * leftShift), y: "+=" + (-params.direction * topShift)}, params.duration, params.easing, params.callback);
    }
}

var Animation = function(fun, params) {
    this.params = params;
    this.run = function(elem, context, callback) {
        fun(elem, context, this.params, callback);
    }
}
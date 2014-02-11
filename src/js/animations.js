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
        
        //Resets the object to its original position if going forwards
        //TODO: measure some sort of initial state and use this in case the object already uses translate x and y
        if (params.direction === 1) {
            $(elem).css({x: 0, y: 0});
        }
        $(elem).css('opacity', 1);
        
        //The position given by $.fn.offset is scaled so we have to account for that
        var position = $(elem).offset();
        position.left = (position.left - context.containerLeft) / context.scale;
        position.top = (position.top - context.containerTop) / context.scale;
        
        switch(params.side) {
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
            break;
        }
        
        if (params.direction === 1) {
            $(elem).css({"x": "+=" + (params.direction * leftShift), "y": "+=" + (params.direction * topShift)});
        }
        //console.log({x: "+=" + (-params.direction * leftShift), y: "+=" + (-params.direction * topShift)});
        $(elem).transit({x: "+=" + (-params.direction * leftShift), y: "+=" + (-params.direction * topShift)}, params.duration, params.easing, params.callback);
    }
}

function Animation(fun, params) {
    this.params = params;
    this.fun = fun;
    //Valid values for start are onstep, withprevious and afterprevious
    this.start = "onstep";
    this.delay = 0;
    this._elem = null;
    this.run = function(context, reverse) {
        var nparams = this.params;
        if (reverse) {
            nparams = $.extend({}, this.params, {direction: -this.params.direction});
        }
        console.log(this);
        this.fun(this._elem, context, nparams, function() { });
    }
}
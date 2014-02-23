var animations = {
    appear: function(elem, context, params, callback) {
        if (params.direction === 1) {
            $(elem).css('opacity', '');
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
        if ((params.direction === 1) && (params.domClone)) {
            $(elem).css({x: $(params.domClone).css('x'), y: $(params.domClone).css('y')});
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
        $(elem).transit({x: "+=" + (-params.direction * leftShift), y: "+=" + (-params.direction * topShift)}, params.duration, params.easing, callback);
    },
    animate: function(elem, context, params, callback) {
        var toGo = {};
        if (params.direction === 1) {
            toGo = params.prop;
        } else {
            var e = $(params.domClone);
            for (var i in params.prop) {
                toGo[i] = e.css(i);
            }
        }
        
        $(elem).transit(toGo, params.duration, params.easing, callback);
    },
    fade: function(elem, context, params, callback) {
        //Opacity sucks because we use it for hiding elements
        //TODO: Find a better way of hiding elements
        $(elem).transit({opacity: params.direction === 1 ? 1 : 0}, params.duration, params.easing, callback)
    }
}

function Animation(fun, params) {
    this.params = $.extend(true, {easing: 'easeInOutCubic'}, params);
    //Actual function to run for animation
    this.fun = fun;
    //Valid values for start are onstep, withprevious and afterprevious (not implemented)
    this.start = "onstep";
    //Delay between animation call and it being run (implemented by runner)
    this.delay = 0;
    //Element to run animation on
    this._elem = null;
    //Level of DOM in respect to presentation container
    this.depth = 1;
    //Clone of element before animation is run
    this.domClone = null;
    //Element full of notes for this animation
    this.notes = null;
    this.run = function(context, reverse, nparams, callback) {
        console.log(this._elem);
        if ((!reverse) && (!this.domClone)) {
            this.domClone = $(this._elem).clone();
            //The transforms are not carried through due to some weird quirk with Transit
            //This is one of the only ways to actually do this
            var trans = ($(this._elem).css('transit:transform') || "").toString();
            $(this.domClone).css('transit:transform', new $.transit.Transform(trans));
            this.params.domClone = this.domClone;
        }
        var extender = {};
        if (reverse) {
            extender.direction = -this.params.direction;
        }
        
        this.fun(this._elem, context, $.extend(true, {}, this.params, nparams || {}, extender), callback || function() { });
    }
}
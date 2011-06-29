define(["./_base/kernel", "./_base/sniff", "./dom"], function(dojo, sniff, dom){
  // module:
  //    dojo/dom-style
  // summary:
  //    This module defines the core dojo DOM style API.

  //TODO: split getters and setters? Examples: attr - getAttr/setAttr, style - getStyle/setStyle, and so on.

  // =============================
  // Style Functions
  // =============================

  // getComputedStyle drives most of the style code.
  // Wherever possible, reuse the returned object.
  //
  // API functions below that need to access computed styles accept an
  // optional computedStyle parameter.
  // If this parameter is omitted, the functions will call getComputedStyle themselves.
  // This way, calling code can access computedStyle once, and then pass the reference to
  // multiple API functions.

/*=====
  dojo.getComputedStyle = function(node){
    // summary:
    //    Returns a "computed style" object.
    //
    // description:
    //    Gets a "computed style" object which can be used to gather
    //    information about the current state of the rendered node.
    //
    //    Note that this may behave differently on different browsers.
    //    Values may have different formats and value encodings across
    //    browsers.
    //
    //    Note also that this method is expensive.  Wherever possible,
    //    reuse the returned object.
    //
    //    Use the dojo.style() method for more consistent (pixelized)
    //    return values.
    //
    // node: DOMNode
    //    A reference to a DOM node. Does NOT support taking an
    //    ID string for speed reasons.
    // example:
    //  |  dojo.getComputedStyle(dojo.byId('foo')).borderWidth;
    //
    // example:
    //    Reusing the returned object, avoiding multiple lookups:
    //  |  var cs = dojo.getComputedStyle(dojo.byId("someNode"));
    //  |  var w = cs.width, h = cs.height;
    return; // CSS2Properties
  }
=====*/

  // Although we normally eschew argument validation at this
  // level, here we test argument 'node' for (duck)type,
  // by testing nodeType, ecause 'document' is the 'parentNode' of 'body'
  // it is frequently sent to this function even
  // though it is not Element.
  var getComputedStyle;
  //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
  if(sniff.isWebKit){
  //>>excludeEnd("webkitMobile");
    getComputedStyle = function(/*DomNode*/node){
      var s;
      if(node.nodeType == 1){
        var dv = node.ownerDocument.defaultView;
        s = dv.getComputedStyle(node, null);
        if(!s && node.style){
          node.style.display = "";
          s = dv.getComputedStyle(node, null);
        }
      }
      return s || {};
    };
  //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
  }else if(sniff.isIE){
    getComputedStyle = function(node){
      // IE (as of 7) doesn't expose Element like sane browsers
      return node.nodeType == 1 /* ELEMENT_NODE*/ ? node.currentStyle : {};
    };
  }else{
    getComputedStyle = function(node){
      return node.nodeType == 1 ?
        node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
    };
  }
  //>>excludeEnd("webkitMobile");
  dojo.getComputedStyle = getComputedStyle;

  var toPixel;
  //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
  if(!sniff.isIE){
  //>>excludeEnd("webkitMobile");
    toPixel = function(element, value){
      // style values can be floats, client code may want
      // to round for integer pixels.
      return parseFloat(value) || 0;
    };
  //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
  }else{
    toPixel = function(element, avalue){
      if(!avalue){ return 0; }
      // on IE7, medium is usually 4 pixels
      if(avalue == "medium"){ return 4; }
      // style values can be floats, client code may
      // want to round this value for integer pixels.
      if(avalue.slice && avalue.slice(-2) == 'px'){ return parseFloat(avalue); }
      var s = element.style, rs = element.runtimeStyle, cs = element.currentStyle,
        sLeft = s.left, rsLeft = rs.left;
      rs.left = cs.left;
      try{
        // 'avalue' may be incompatible with style.left, which can cause IE to throw
        // this has been observed for border widths using "thin", "medium", "thick" constants
        // those particular constants could be trapped by a lookup
        // but perhaps there are more
        s.left = avalue;
        avalue = s.pixelLeft;
      }catch(e){
        avalue = 0;
      }
      s.left = sLeft;
      rs.left = rsLeft;
      return avalue;
    }
  }
  //>>excludeEnd("webkitMobile");
  dojo._toPixelValue = toPixel;

  // FIXME: there opacity quirks on FF that we haven't ported over. Hrm.
  /*=====
  dojo._getOpacity = function(node){
      // summary:
      //    Returns the current opacity of the passed node as a
      //    floating-point value between 0 and 1.
      // node: DomNode
      //    a reference to a DOM node. Does NOT support taking an
      //    ID string for speed reasons.
      // returns:
      //    Number between 0 and 1
      return; // Number
  }
  =====*/

  //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
  var astr = "DXImageTransform.Microsoft.Alpha";
  var af = function(n, f){
    try{
      return n.filters.item(astr);
    }catch(e){
      return f ? {} : null;
    }
  };

  //>>excludeEnd("webkitMobile");
  var _getOpacity =
  //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
    sniff.isIE < 9 || (sniff.isIE && sniff.isQuirks) ? function(node){
      try{
        return af(node).Opacity / 100; // Number
      }catch(e){
        return 1; // Number
      }
    } :
  //>>excludeEnd("webkitMobile");
    function(node){
      return getComputedStyle(node).opacity;
    };

  /*=====
  dojo._setOpacity = function(node, opacity){
      // summary:
      //    set the opacity of the passed node portably. Returns the
      //    new opacity of the node.
      // node: DOMNode
      //    a reference to a DOM node. Does NOT support taking an
      //    ID string for performance reasons.
      // opacity: Number
      //    A Number between 0 and 1. 0 specifies transparent.
      // returns:
      //    Number between 0 and 1
      return; // Number
  }
  =====*/

  var _setOpacity =
    //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
    sniff.isIE < 9 || (sniff.isIE && sniff.isQuirks) ? function(/*DomNode*/node, /*Number*/opacity){
      var ov = opacity * 100, opaque = opacity == 1;
      node.style.zoom = opaque ? "" : 1;

      if(!af(node)){
        if(opaque){
          return opacity;
        }
        node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
      }else{
        af(node, 1).Opacity = ov;
      }

      // on IE7 Alpha(Filter opacity=100) makes text look fuzzy so disable it altogether (bug #2661),
      //but still update the opacity value so we can get a correct reading if it is read later.
      af(node, 1).Enabled = !opaque;

      if(node.tagName.toLowerCase() == "tr"){
        for(var td = node.firstChild; td; td = td.nextSibling){
          if(td.tagName.toLowerCase() == "td"){
            _setOpacity(td, opacity);
          }
        }
      }
      return opacity;
    } :
    //>>excludeEnd("webkitMobile");
    function(node, opacity){
      return node.style.opacity = opacity;
    };

  var _pixelNamesCache = {
    left: true, top: true
  };
  var _pixelRegExp = /margin|padding|width|height|max|min|offset/; // |border
  function _toStyleValue(node, type, value){
    //TODO: should we really be doing string case conversion here? Should we cache it? Need to profile!
    type = type.toLowerCase();
    //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
    if(sniff.isIE){
      if(value == "auto"){
        if(type == "height"){ return node.offsetHeight; }
        if(type == "width"){ return node.offsetWidth; }
      }
      if(type == "fontweight"){
        switch(value){
          case 700: return "bold";
          case 400:
          default: return "normal";
        }
      }
    }
    //>>excludeEnd("webkitMobile");
    if(!(type in _pixelNamesCache)){
      _pixelNamesCache[type] = _pixelRegExp.test(type);
    }
    return _pixelNamesCache[type] ? toPixel(node, value) : value;
  }

  var _floatStyle = sniff.isIE ? "styleFloat" : "cssFloat",
    _floatAliases = { "cssFloat": _floatStyle, "styleFloat": _floatStyle, "float": _floatStyle };

  // public API

  dojo.style = function(  /*DomNode|String*/ node,
              /*String?|Object?*/ style,
              /*String?*/ value){
    // summary:
    //    Accesses styles on a node. If 2 arguments are
    //    passed, acts as a getter. If 3 arguments are passed, acts
    //    as a setter.
    // description:
    //    Getting the style value uses the computed style for the node, so the value
    //    will be a calculated value, not just the immediate node.style value.
    //    Also when getting values, use specific style names,
    //    like "borderBottomWidth" instead of "border" since compound values like
    //    "border" are not necessarily reflected as expected.
    //    If you want to get node dimensions, use `dojo.marginBox()`,
    //    `dojo.contentBox()` or `dojo.position()`.
    // node:
    //    id or reference to node to get/set style for
    // style:
    //    the style property to set in DOM-accessor format
    //    ("borderWidth", not "border-width") or an object with key/value
    //    pairs suitable for setting each property.
    // value:
    //    If passed, sets value on the node for style, handling
    //    cross-browser concerns.  When setting a pixel value,
    //    be sure to include "px" in the value. For instance, top: "200px".
    //    Otherwise, in some cases, some browsers will not apply the style.
    // example:
    //    Passing only an ID or node returns the computed style object of
    //    the node:
    //  |  dojo.style("thinger");
    // example:
    //    Passing a node and a style property returns the current
    //    normalized, computed value for that property:
    //  |  dojo.style("thinger", "opacity"); // 1 by default
    //
    // example:
    //    Passing a node, a style property, and a value changes the
    //    current display of the node and returns the new computed value
    //  |  dojo.style("thinger", "opacity", 0.5); // == 0.5
    //
    // example:
    //    Passing a node, an object-style style property sets each of the values in turn and returns the computed style object of the node:
    //  |  dojo.style("thinger", {
    //  |    "opacity": 0.5,
    //  |    "border": "3px solid black",
    //  |    "height": "300px"
    //  |  });
    //
    // example:
    //    When the CSS style property is hyphenated, the JavaScript property is camelCased.
    //    font-size becomes fontSize, and so on.
    //  |  dojo.style("thinger",{
    //  |    fontSize:"14pt",
    //  |    letterSpacing:"1.2em"
    //  |  });
    //
    // example:
    //    dojo.NodeList implements .style() using the same syntax, omitting the "node" parameter, calling
    //    dojo.style() on every element of the list. See: `dojo.query()` and `dojo.NodeList()`
    //  |  dojo.query(".someClassName").style("visibility","hidden");
    //  |  // or
    //  |  dojo.query("#baz > div").style({
    //  |    opacity:0.75,
    //  |    fontSize:"13pt"
    //  |  });

    var n = dom.byId(node), l = arguments.length, op = (style == "opacity");
    style = _floatAliases[style] || style;
    if(l == 3){
      return op ? _setOpacity(n, value) : n.style[style] = value; /* Number */
    }
    if(l == 2 && op){
      return _getOpacity(n);
    }
    var s = getComputedStyle(n);
    if(l == 2 && typeof style != "string"){ // inline'd type check
      for(var x in style){
        dojo.style(node, x, style[x]);
      }
      return s;
    }
    return (l == 1) ? s : _toStyleValue(n, style, s[style] || n.style[style]); /* CSS2Properties||String||Number */
  };

  // TODO: add getters/setters for style()?

  return {
    style:            dojo.style,
    getComputedStyle: dojo.getComputedStyle,
    toPixelValue:     dojo._toPixelValue    // TODO: make it public?
  };
});

/**

 * Isotope v1.5.25

 * An exquisite jQuery plugin for magical layouts

 * http://isotope.metafizzy.co

 *

 * Commercial use requires one-time purchase of a commercial license

 * http://isotope.metafizzy.co/docs/license.html

 *

 * Non-commercial use is licensed under the MIT License

 *

 * Copyright 2013 Metafizzy

 */

(function(window, $, undefined) {
    'use strict';
    var document = window.document;
    var Modernizr = window.Modernizr;
    var capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    };
    var prefixes = 'Moz Webkit O Ms'.split(' ');
    var getStyleProperty = function(propName) {
        var style = document.documentElement.style,
            prefixed;
        if (typeof style[propName] === 'string') {
            return propName
        }
        propName = capitalize(propName);
        for (var i = 0, len = prefixes.length; i < len; i++) {
            prefixed = prefixes[i] + propName;
            if (typeof style[prefixed] === 'string') {
                return prefixed
            }
        }
    };
    var transformProp = getStyleProperty('transform'),
        transitionProp = getStyleProperty('transitionProperty');
    var tests = {
        csstransforms: function() {
            return !!transformProp
        },
        csstransforms3d: function() {
            var test = !!getStyleProperty('perspective');
            if (test) {
                var vendorCSSPrefixes = ' -o- -moz- -ms- -webkit- -khtml- '.split(' '),
                    mediaQuery = '@media (' + vendorCSSPrefixes.join('transform-3d),(') + 'modernizr)',
                    $style = $('<style>' + mediaQuery + '{#modernizr{height:3px}}</style>').appendTo('head'),
                    $div = $('<div id="modernizr" />').appendTo('html');
                test = $div.height() === 3;
                $div.remove();
                $style.remove()
            }
            return test
        },
        csstransitions: function() {
            return !!transitionProp
        }
    };
    var testName;
    if (Modernizr) {
        for (testName in tests) {
            if (!Modernizr.hasOwnProperty(testName)) {
                Modernizr.addTest(testName, tests[testName])
            }
        }
    } else {
        Modernizr = window.Modernizr = {
            _version: '1.6ish: miniModernizr for Isotope'
        };
        var classes = ' ';
        var result;
        for (testName in tests) {
            result = tests[testName]();
            Modernizr[testName] = result;
            classes += ' ' + (result ? '' : 'no-') + testName
        }
        $('html').addClass(classes)
    }
    if (Modernizr.csstransforms) {
        var transformFnNotations = Modernizr.csstransforms3d ? {
            translate: function(position) {
                return 'translate3d(' + position[0] + 'px, ' + position[1] + 'px, 0) '
            },
            scale: function(scale) {
                return 'scale3d(' + scale + ', ' + scale + ', 1) '
            }
        } : {
            translate: function(position) {
                return 'translate(' + position[0] + 'px, ' + position[1] + 'px) '
            },
            scale: function(scale) {
                return 'scale(' + scale + ') '
            }
        };
        var setIsoTransform = function(elem, name, value) {
            var data = $.data(elem, 'isoTransform') || {},
                newData = {},
                fnName, transformObj = {},
                transformValue;
            newData[name] = value;
            $.extend(data, newData);
            for (fnName in data) {
                transformValue = data[fnName];
                transformObj[fnName] = transformFnNotations[fnName](transformValue)
            }
            var translateFn = transformObj.translate || '',
                scaleFn = transformObj.scale || '',
                valueFns = translateFn + scaleFn;
            $.data(elem, 'isoTransform', data);
            elem.style[transformProp] = valueFns
        };
        $.cssNumber.scale = true;
        $.cssHooks.scale = {
            set: function(elem, value) {
                setIsoTransform(elem, 'scale', value)
            },
            get: function(elem, computed) {
                var transform = $.data(elem, 'isoTransform');
                return transform && transform.scale ? transform.scale : 1
            }
        };
        $.fx.step.scale = function(fx) {
            $.cssHooks.scale.set(fx.elem, fx.now + fx.unit)
        };
        $.cssNumber.translate = true;
        $.cssHooks.translate = {
            set: function(elem, value) {
                setIsoTransform(elem, 'translate', value)
            },
            get: function(elem, computed) {
                var transform = $.data(elem, 'isoTransform');
                return transform && transform.translate ? transform.translate : [0, 0]
            }
        }
    }
    var transitionEndEvent, transitionDurProp;
    if (Modernizr.csstransitions) {
        transitionEndEvent = {
            WebkitTransitionProperty: 'webkitTransitionEnd',
            MozTransitionProperty: 'transitionend',
            OTransitionProperty: 'oTransitionEnd otransitionend',
            transitionProperty: 'transitionend'
        }[transitionProp];
        transitionDurProp = getStyleProperty('transitionDuration')
    }
    var $event = $.event,
        dispatchMethod = $.event.handle ? 'handle' : 'dispatch',
        resizeTimeout;
    $event.special.smartresize = {
        setup: function() {
            $(this).bind("resize", $event.special.smartresize.handler)
        },
        teardown: function() {
            $(this).unbind("resize", $event.special.smartresize.handler)
        },
        handler: function(event, execAsap) {
            var context = this,
                args = arguments;
            event.type = "smartresize";
            if (resizeTimeout) {
                clearTimeout(resizeTimeout)
            }
            resizeTimeout = setTimeout(function() {
                $event[dispatchMethod].apply(context, args)
            }, execAsap === "execAsap" ? 0 : 100)
        }
    };
    $.fn.smartresize = function(fn) {
        return fn ? this.bind("smartresize", fn) : this.trigger("smartresize", ["execAsap"])
    };
    $.Isotope = function(options, element, callback) {
        this.element = $(element);
        this._create(options);
        this._init(callback)
    };
    var isoContainerStyles = ['width', 'height'];
    var $window = $(window);
    $.Isotope.settings = {
        resizable: true,
        layoutMode: 'masonry',
        containerClass: 'isotope',
        itemClass: 'isotope-item',
        hiddenClass: 'isotope-hidden',
        hiddenStyle: {
            opacity: 0,
            scale: 0.001
        },
        visibleStyle: {
            opacity: 1,
            scale: 1
        },
        containerStyle: {
            position: 'relative',
            overflow: 'hidden'
        },
        animationEngine: 'best-available',
        animationOptions: {
            queue: false,
            duration: 800
        },
        sortBy: 'original-order',
        sortAscending: true,
        resizesContainer: true,
        transformsEnabled: true,
        itemPositionDataEnabled: false
    };
    $.Isotope.prototype = {
        _create: function(options) {
            this.options = $.extend({}, $.Isotope.settings, options);
            this.styleQueue = [];
            this.elemCount = 0;
            var elemStyle = this.element[0].style;
            this.originalStyle = {};
            var containerStyles = isoContainerStyles.slice(0);
            for (var prop in this.options.containerStyle) {
                containerStyles.push(prop)
            }
            for (var i = 0, len = containerStyles.length; i < len; i++) {
                prop = containerStyles[i];
                this.originalStyle[prop] = elemStyle[prop] || ''
            }
            this.element.css(this.options.containerStyle);
            this._updateAnimationEngine();
            this._updateUsingTransforms();
            var originalOrderSorter = {
                'original-order': function($elem, instance) {
                    instance.elemCount++;
                    return instance.elemCount
                },
                random: function() {
                    return Math.random()
                }
            };
            this.options.getSortData = $.extend(this.options.getSortData, originalOrderSorter);
            this.reloadItems();
            this.offset = {
                left: parseInt((this.element.css('padding-left') || 0), 10),
                top: parseInt((this.element.css('padding-top') || 0), 10)
            };
            var instance = this;
            setTimeout(function() {
                instance.element.addClass(instance.options.containerClass)
            }, 0);
            if (this.options.resizable) {
                $window.bind('smartresize.isotope', function() {
                    instance.resize()
                })
            }
            this.element.delegate('.' + this.options.hiddenClass, 'click', function() {
                return false
            })
        },
        _getAtoms: function($elems) {
            var selector = this.options.itemSelector,
                $atoms = selector ? $elems.filter(selector).add($elems.find(selector)) : $elems,
                atomStyle = {
                    position: 'absolute'
                };
            $atoms = $atoms.filter(function(i, atom) {
                return atom.nodeType === 1
            });
            if (this.usingTransforms) {
                atomStyle.left = 0;
                atomStyle.top = 0
            }
            $atoms.css(atomStyle).addClass(this.options.itemClass);
            this.updateSortData($atoms, true);
            return $atoms
        },
        _init: function(callback) {
            this.$filteredAtoms = this._filter(this.$allAtoms);
            this._sort();
            this.reLayout(callback)
        },
        option: function(opts) {
            if ($.isPlainObject(opts)) {
                this.options = $.extend(true, this.options, opts);
                var updateOptionFn;
                for (var optionName in opts) {
                    updateOptionFn = '_update' + capitalize(optionName);
                    if (this[updateOptionFn]) {
                        this[updateOptionFn]()
                    }
                }
            }
        },
        _updateAnimationEngine: function() {
            var animationEngine = this.options.animationEngine.toLowerCase().replace(/[ _\-]/g, '');
            var isUsingJQueryAnimation;
            switch (animationEngine) {
                case 'css':
                case 'none':
                    isUsingJQueryAnimation = false;
                    break;
                case 'jquery':
                    isUsingJQueryAnimation = true;
                    break;
                default:
                    isUsingJQueryAnimation = !Modernizr.csstransitions
            }
            this.isUsingJQueryAnimation = isUsingJQueryAnimation;
            this._updateUsingTransforms()
        },
        _updateTransformsEnabled: function() {
            this._updateUsingTransforms()
        },
        _updateUsingTransforms: function() {
            var usingTransforms = this.usingTransforms = this.options.transformsEnabled && Modernizr.csstransforms && Modernizr.csstransitions && !this.isUsingJQueryAnimation;
            if (!usingTransforms) {
                delete this.options.hiddenStyle.scale;
                delete this.options.visibleStyle.scale
            }
            this.getPositionStyles = usingTransforms ? this._translate : this._positionAbs
        },
        _filter: function($atoms) {
            var filter = this.options.filter === '' ? '*' : this.options.filter;
            if (!filter) {
                return $atoms
            }
            var hiddenClass = this.options.hiddenClass,
                hiddenSelector = '.' + hiddenClass,
                $hiddenAtoms = $atoms.filter(hiddenSelector),
                $atomsToShow = $hiddenAtoms;
            if (filter !== '*') {
                $atomsToShow = $hiddenAtoms.filter(filter);
                var $atomsToHide = $atoms.not(hiddenSelector).not(filter).addClass(hiddenClass);
                this.styleQueue.push({
                    $el: $atomsToHide,
                    style: this.options.hiddenStyle
                })
            }
            this.styleQueue.push({
                $el: $atomsToShow,
                style: this.options.visibleStyle
            });
            $atomsToShow.removeClass(hiddenClass);
            return $atoms.filter(filter)
        },
        updateSortData: function($atoms, isIncrementingElemCount) {
            var instance = this,
                getSortData = this.options.getSortData,
                $this, sortData;
            $atoms.each(function() {
                $this = $(this);
                sortData = {};
                for (var key in getSortData) {
                    if (!isIncrementingElemCount && key === 'original-order') {
                        sortData[key] = $.data(this, 'isotope-sort-data')[key]
                    } else {
                        sortData[key] = getSortData[key]($this, instance)
                    }
                }
                $.data(this, 'isotope-sort-data', sortData)
            })
        },
        _sort: function() {
            var sortBy = this.options.sortBy,
                getSorter = this._getSorter,
                sortDir = this.options.sortAscending ? 1 : -1,
                sortFn = function(alpha, beta) {
                    var a = getSorter(alpha, sortBy),
                        b = getSorter(beta, sortBy);
                    if (a === b && sortBy !== 'original-order') {
                        a = getSorter(alpha, 'original-order');
                        b = getSorter(beta, 'original-order')
                    }
                    return ((a > b) ? 1 : (a < b) ? -1 : 0) * sortDir
                };
            this.$filteredAtoms.sort(sortFn)
        },
        _getSorter: function(elem, sortBy) {
            return $.data(elem, 'isotope-sort-data')[sortBy]
        },
        _translate: function(x, y) {
            return {
                translate: [x, y]
            }
        },
        _positionAbs: function(x, y) {
            return {
                left: x,
                top: y
            }
        },
        _pushPosition: function($elem, x, y) {
            x = Math.round(x + this.offset.left);
            y = Math.round(y + this.offset.top);
            var position = this.getPositionStyles(x, y);
            this.styleQueue.push({
                $el: $elem,
                style: position
            });
            if (this.options.itemPositionDataEnabled) {
                $elem.data('isotope-item-position', {
                    x: x,
                    y: y
                })
            }
        },
        layout: function($elems, callback) {
            var layoutMode = this.options.layoutMode;
            this['_' + layoutMode + 'Layout']($elems);
            if (this.options.resizesContainer) {
                var containerStyle = this['_' + layoutMode + 'GetContainerSize']();
                this.styleQueue.push({
                    $el: this.element,
                    style: containerStyle
                })
            }
            this._processStyleQueue($elems, callback);
            this.isLaidOut = true
        },
        _processStyleQueue: function($elems, callback) {
            var styleFn = !this.isLaidOut ? 'css' : (this.isUsingJQueryAnimation ? 'animate' : 'css'),
                animOpts = this.options.animationOptions,
                onLayout = this.options.onLayout,
                objStyleFn, processor, triggerCallbackNow, callbackFn;
            processor = function(i, obj) {
                obj.$el[styleFn](obj.style, animOpts)
            };
            if (this._isInserting && this.isUsingJQueryAnimation) {
                processor = function(i, obj) {
                    objStyleFn = obj.$el.hasClass('no-transition') ? 'css' : styleFn;
                    obj.$el[objStyleFn](obj.style, animOpts)
                }
            } else if (callback || onLayout || animOpts.complete) {
                var isCallbackTriggered = false,
                    callbacks = [callback, onLayout, animOpts.complete],
                    instance = this;
                triggerCallbackNow = true;
                callbackFn = function() {
                    if (isCallbackTriggered) {
                        return
                    }
                    var hollaback;
                    for (var i = 0, len = callbacks.length; i < len; i++) {
                        hollaback = callbacks[i];
                        if (typeof hollaback === 'function') {
                            hollaback.call(instance.element, $elems, instance)
                        }
                    }
                    isCallbackTriggered = true
                };
                if (this.isUsingJQueryAnimation && styleFn === 'animate') {
                    animOpts.complete = callbackFn;
                    triggerCallbackNow = false
                } else if (Modernizr.csstransitions) {
                    var i = 0,
                        firstItem = this.styleQueue[0],
                        testElem = firstItem && firstItem.$el,
                        styleObj;
                    while (!testElem || !testElem.length) {
                        styleObj = this.styleQueue[i++];
                        if (!styleObj) {
                            return
                        }
                        testElem = styleObj.$el
                    }
                    var duration = parseFloat(getComputedStyle(testElem[0])[transitionDurProp]);
                    if (duration > 0) {
                        processor = function(i, obj) {
                            obj.$el[styleFn](obj.style, animOpts).one(transitionEndEvent, callbackFn)
                        };
                        triggerCallbackNow = false
                    }
                }
            }
            $.each(this.styleQueue, processor);
            if (triggerCallbackNow) {
                callbackFn()
            }
            this.styleQueue = []
        },
        resize: function() {
            if (this['_' + this.options.layoutMode + 'ResizeChanged']()) {
                this.reLayout()
            }
        },
        reLayout: function(callback) {
            this['_' + this.options.layoutMode + 'Reset']();
            this.layout(this.$filteredAtoms, callback)
        },
        addItems: function($content, callback) {
            var $newAtoms = this._getAtoms($content);
            this.$allAtoms = this.$allAtoms.add($newAtoms);
            if (callback) {
                callback($newAtoms)
            }
        },
        insert: function($content, callback) {
            this.element.append($content);
            var instance = this;
            this.addItems($content, function($newAtoms) {
                var $newFilteredAtoms = instance._filter($newAtoms);
                instance._addHideAppended($newFilteredAtoms);
                instance._sort();
                instance.reLayout();
                instance._revealAppended($newFilteredAtoms, callback)
            })
        },
        appended: function($content, callback) {
            var instance = this;
            this.addItems($content, function($newAtoms) {
                instance._addHideAppended($newAtoms);
                instance.layout($newAtoms);
                instance._revealAppended($newAtoms, callback)
            })
        },
        _addHideAppended: function($newAtoms) {
            this.$filteredAtoms = this.$filteredAtoms.add($newAtoms);
            $newAtoms.addClass('no-transition');
            this._isInserting = true;
            this.styleQueue.push({
                $el: $newAtoms,
                style: this.options.hiddenStyle
            })
        },
        _revealAppended: function($newAtoms, callback) {
            var instance = this;
            setTimeout(function() {
                $newAtoms.removeClass('no-transition');
                instance.styleQueue.push({
                    $el: $newAtoms,
                    style: instance.options.visibleStyle
                });
                instance._isInserting = false;
                instance._processStyleQueue($newAtoms, callback)
            }, 10)
        },
        reloadItems: function() {
            this.$allAtoms = this._getAtoms(this.element.children())
        },
        remove: function($content, callback) {
            this.$allAtoms = this.$allAtoms.not($content);
            this.$filteredAtoms = this.$filteredAtoms.not($content);
            var instance = this;
            var removeContent = function() {
                $content.remove();
                if (callback) {
                    callback.call(instance.element)
                }
            };
            if ($content.filter(':not(.' + this.options.hiddenClass + ')').length) {
                this.styleQueue.push({
                    $el: $content,
                    style: this.options.hiddenStyle
                });
                this._sort();
                this.reLayout(removeContent)
            } else {
                removeContent()
            }
        },
        shuffle: function(callback) {
            this.updateSortData(this.$allAtoms);
            this.options.sortBy = 'random';
            this._sort();
            this.reLayout(callback)
        },
        destroy: function() {
            var usingTransforms = this.usingTransforms;
            var options = this.options;
            this.$allAtoms.removeClass(options.hiddenClass + ' ' + options.itemClass).each(function() {
                var style = this.style;
                style.position = '';
                style.top = '';
                style.left = '';
                style.opacity = '';
                if (usingTransforms) {
                    style[transformProp] = ''
                }
            });
            var elemStyle = this.element[0].style;
            for (var prop in this.originalStyle) {
                elemStyle[prop] = this.originalStyle[prop]
            }
            this.element.unbind('.isotope').undelegate('.' + options.hiddenClass, 'click').removeClass(options.containerClass).removeData('isotope');
            $window.unbind('.isotope')
        },
        _getSegments: function(isRows) {
            var namespace = this.options.layoutMode,
                measure = isRows ? 'rowHeight' : 'columnWidth',
                size = isRows ? 'height' : 'width',
                segmentsName = isRows ? 'rows' : 'cols',
                containerSize = this.element[size](),
                segments, segmentSize = this.options[namespace] && this.options[namespace][measure] || this.$filteredAtoms['outer' + capitalize(size)](true) || containerSize;
            segments = Math.floor(containerSize / segmentSize);
            segments = Math.max(segments, 1);
            this[namespace][segmentsName] = segments;
            this[namespace][measure] = segmentSize
        },
        _checkIfSegmentsChanged: function(isRows) {
            var namespace = this.options.layoutMode,
                segmentsName = isRows ? 'rows' : 'cols',
                prevSegments = this[namespace][segmentsName];
            this._getSegments(isRows);
            return (this[namespace][segmentsName] !== prevSegments)
        },
        _masonryReset: function() {
            this.masonry = {};
            this._getSegments();
            var i = this.masonry.cols;
            this.masonry.colYs = [];
            while (i--) {
                this.masonry.colYs.push(0)
            }
        },
        _masonryLayout: function($elems) {
            var instance = this,
                props = instance.masonry;
            $elems.each(function() {
                var $this = $(this),
                    colSpan = Math.ceil($this.outerWidth(true) / props.columnWidth);
                colSpan = Math.min(colSpan, props.cols);
                if (colSpan === 1) {
                    instance._masonryPlaceBrick($this, props.colYs)
                } else {
                    var groupCount = props.cols + 1 - colSpan,
                        groupY = [],
                        groupColY, i;
                    for (i = 0; i < groupCount; i++) {
                        groupColY = props.colYs.slice(i, i + colSpan);
                        groupY[i] = Math.max.apply(Math, groupColY)
                    }
                    instance._masonryPlaceBrick($this, groupY)
                }
            })
        },
        _masonryPlaceBrick: function($brick, setY) {
            var minimumY = Math.min.apply(Math, setY),
                shortCol = 0;
            for (var i = 0, len = setY.length; i < len; i++) {
                if (setY[i] === minimumY) {
                    shortCol = i;
                    break
                }
            }
            var x = this.masonry.columnWidth * shortCol,
                y = minimumY;
            this._pushPosition($brick, x, y);
            var setHeight = minimumY + $brick.outerHeight(true),
                setSpan = this.masonry.cols + 1 - len;
            for (i = 0; i < setSpan; i++) {
                this.masonry.colYs[shortCol + i] = setHeight
            }
        },
        _masonryGetContainerSize: function() {
            var containerHeight = Math.max.apply(Math, this.masonry.colYs);
            return {
                height: containerHeight
            }
        },
        _masonryResizeChanged: function() {
            return this._checkIfSegmentsChanged()
        },
        _fitRowsReset: function() {
            this.fitRows = {
                x: 0,
                y: 0,
                height: 0
            }
        },
        _fitRowsLayout: function($elems) {
            var instance = this,
                containerWidth = this.element.width(),
                props = this.fitRows;
            $elems.each(function() {
                var $this = $(this),
                    atomW = $this.outerWidth(true),
                    atomH = $this.outerHeight(true);
                if (props.x !== 0 && atomW + props.x > containerWidth) {
                    props.x = 0;
                    props.y = props.height
                }
                instance._pushPosition($this, props.x, props.y);
                props.height = Math.max(props.y + atomH, props.height);
                props.x += atomW
            })
        },
        _fitRowsGetContainerSize: function() {
            return {
                height: this.fitRows.height
            }
        },
        _fitRowsResizeChanged: function() {
            return true
        },
        _cellsByRowReset: function() {
            this.cellsByRow = {
                index: 0
            };
            this._getSegments();
            this._getSegments(true)
        },
        _cellsByRowLayout: function($elems) {
            var instance = this,
                props = this.cellsByRow;
            $elems.each(function() {
                var $this = $(this),
                    col = props.index % props.cols,
                    row = Math.floor(props.index / props.cols),
                    x = (col + 0.5) * props.columnWidth - $this.outerWidth(true) / 2,
                    y = (row + 0.5) * props.rowHeight - $this.outerHeight(true) / 2;
                instance._pushPosition($this, x, y);
                props.index++
            })
        },
        _cellsByRowGetContainerSize: function() {
            return {
                height: Math.ceil(this.$filteredAtoms.length / this.cellsByRow.cols) * this.cellsByRow.rowHeight + this.offset.top
            }
        },
        _cellsByRowResizeChanged: function() {
            return this._checkIfSegmentsChanged()
        },
        _straightDownReset: function() {
            this.straightDown = {
                y: 0
            }
        },
        _straightDownLayout: function($elems) {
            var instance = this;
            $elems.each(function(i) {
                var $this = $(this);
                instance._pushPosition($this, 0, instance.straightDown.y);
                instance.straightDown.y += $this.outerHeight(true)
            })
        },
        _straightDownGetContainerSize: function() {
            return {
                height: this.straightDown.y
            }
        },
        _straightDownResizeChanged: function() {
            return true
        },
        _masonryHorizontalReset: function() {
            this.masonryHorizontal = {};
            this._getSegments(true);
            var i = this.masonryHorizontal.rows;
            this.masonryHorizontal.rowXs = [];
            while (i--) {
                this.masonryHorizontal.rowXs.push(0)
            }
        },
        _masonryHorizontalLayout: function($elems) {
            var instance = this,
                props = instance.masonryHorizontal;
            $elems.each(function() {
                var $this = $(this),
                    rowSpan = Math.ceil($this.outerHeight(true) / props.rowHeight);
                rowSpan = Math.min(rowSpan, props.rows);
                if (rowSpan === 1) {
                    instance._masonryHorizontalPlaceBrick($this, props.rowXs)
                } else {
                    var groupCount = props.rows + 1 - rowSpan,
                        groupX = [],
                        groupRowX, i;
                    for (i = 0; i < groupCount; i++) {
                        groupRowX = props.rowXs.slice(i, i + rowSpan);
                        groupX[i] = Math.max.apply(Math, groupRowX)
                    }
                    instance._masonryHorizontalPlaceBrick($this, groupX)
                }
            })
        },
        _masonryHorizontalPlaceBrick: function($brick, setX) {
            var minimumX = Math.min.apply(Math, setX),
                smallRow = 0;
            for (var i = 0, len = setX.length; i < len; i++) {
                if (setX[i] === minimumX) {
                    smallRow = i;
                    break
                }
            }
            var x = minimumX,
                y = this.masonryHorizontal.rowHeight * smallRow;
            this._pushPosition($brick, x, y);
            var setWidth = minimumX + $brick.outerWidth(true),
                setSpan = this.masonryHorizontal.rows + 1 - len;
            for (i = 0; i < setSpan; i++) {
                this.masonryHorizontal.rowXs[smallRow + i] = setWidth
            }
        },
        _masonryHorizontalGetContainerSize: function() {
            var containerWidth = Math.max.apply(Math, this.masonryHorizontal.rowXs);
            return {
                width: containerWidth
            }
        },
        _masonryHorizontalResizeChanged: function() {
            return this._checkIfSegmentsChanged(true)
        },
        _fitColumnsReset: function() {
            this.fitColumns = {
                x: 0,
                y: 0,
                width: 0
            }
        },
        _fitColumnsLayout: function($elems) {
            var instance = this,
                containerHeight = this.element.height(),
                props = this.fitColumns;
            $elems.each(function() {
                var $this = $(this),
                    atomW = $this.outerWidth(true),
                    atomH = $this.outerHeight(true);
                if (props.y !== 0 && atomH + props.y > containerHeight) {
                    props.x = props.width;
                    props.y = 0
                }
                instance._pushPosition($this, props.x, props.y);
                props.width = Math.max(props.x + atomW, props.width);
                props.y += atomH
            })
        },
        _fitColumnsGetContainerSize: function() {
            return {
                width: this.fitColumns.width
            }
        },
        _fitColumnsResizeChanged: function() {
            return true
        },
        _cellsByColumnReset: function() {
            this.cellsByColumn = {
                index: 0
            };
            this._getSegments();
            this._getSegments(true)
        },
        _cellsByColumnLayout: function($elems) {
            var instance = this,
                props = this.cellsByColumn;
            $elems.each(function() {
                var $this = $(this),
                    col = Math.floor(props.index / props.rows),
                    row = props.index % props.rows,
                    x = (col + 0.5) * props.columnWidth - $this.outerWidth(true) / 2,
                    y = (row + 0.5) * props.rowHeight - $this.outerHeight(true) / 2;
                instance._pushPosition($this, x, y);
                props.index++
            })
        },
        _cellsByColumnGetContainerSize: function() {
            return {
                width: Math.ceil(this.$filteredAtoms.length / this.cellsByColumn.rows) * this.cellsByColumn.columnWidth
            }
        },
        _cellsByColumnResizeChanged: function() {
            return this._checkIfSegmentsChanged(true)
        },
        _straightAcrossReset: function() {
            this.straightAcross = {
                x: 0
            }
        },
        _straightAcrossLayout: function($elems) {
            var instance = this;
            $elems.each(function(i) {
                var $this = $(this);
                instance._pushPosition($this, instance.straightAcross.x, 0);
                instance.straightAcross.x += $this.outerWidth(true)
            })
        },
        _straightAcrossGetContainerSize: function() {
            return {
                width: this.straightAcross.x
            }
        },
        _straightAcrossResizeChanged: function() {
            return true
        }
    };
    $.fn.getOutOfHere = function(callback) {
        var $this = this,
            $images = $this.find('img').add($this.filter('img')),
            len = $images.length,
            blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            loaded = [];

        function triggerCallback() {
            callback.call($this, $images)
        }

        function imgLoaded(event) {
            var img = event.target;
            if (img.src !== blank && $.inArray(img, loaded) === -1) {
                loaded.push(img);
                if (--len <= 0) {
                    setTimeout(triggerCallback);
                    $images.unbind('.imagesLoaded', imgLoaded)
                }
            }
        }
        if (!len) {
            triggerCallback()
        }
        $images.bind('load.imagesLoaded error.imagesLoaded', imgLoaded).each(function() {
            var src = this.src;
            this.src = blank;
            this.src = src
        });
        return $this
    };
    var logError = function(message) {
        if (window.console) {
            window.console.error(message)
        }
    };
    $.fn.isotope = function(options, callback) {
        if (typeof options === 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function() {
                var instance = $.data(this, 'isotope');
                if (!instance) {
                    logError("cannot call methods on isotope prior to initialization; attempted to call method '" + options + "'");
                    return
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for isotope instance");
                    return
                }
                instance[options].apply(instance, args)
            })
        } else {
            this.each(function() {
                var instance = $.data(this, 'isotope');
                if (instance) {
                    instance.option(options);
                    instance._init(callback)
                } else {
                    $.data(this, 'isotope', new $.Isotope(options, this, callback))
                }
            })
        }
        return this
    }
})(window, jQuery);

/* Modernizr 2.7.1 (Custom Build) | MIT & BSD

 * Build: http://modernizr.com/download/#-inlinesvg-touch-shiv-cssclasses-teststyles-prefixes-css_filters-svg_filters-load

 */

;
window.Modernizr = function(a, b, c) {
        function x(a) {
            j.cssText = a
        }

        function y(a, b) {
            return x(m.join(a + ";") + (b || ""))
        }

        function z(a, b) {
            return typeof a === b
        }

        function A(a, b) {
            return !!~("" + a).indexOf(b)
        }

        function B(a, b, d) {
            for (var e in a) {
                var f = b[a[e]];
                if (f !== c) return d === !1 ? a[e] : z(f, "function") ? f.bind(d || b) : f
            }
            return !1
        }
        var d = "2.7.1",
            e = {},
            f = !0,
            g = b.documentElement,
            h = "modernizr",
            i = b.createElement(h),
            j = i.style,
            k, l = {}.toString,
            m = " -webkit- -moz- -o- -ms- ".split(" "),
            n = {
                svg: "http://www.w3.org/2000/svg"
            },
            o = {},
            p = {},
            q = {},
            r = [],
            s = r.slice,
            t, u = function(a, c, d, e) {
                var f, i, j, k, l = b.createElement("div"),
                    m = b.body,
                    n = m || b.createElement("body");
                if (parseInt(d, 10))
                    while (d--) j = b.createElement("div"), j.id = e ? e[d] : h + (d + 1), l.appendChild(j);
                return f = ["&#173;", '<style id="s', h, '">', a, "</style>"].join(""), l.id = h, (m ? l : n).innerHTML += f, n.appendChild(l), m || (n.style.background = "", n.style.overflow = "hidden", k = g.style.overflow, g.style.overflow = "hidden", g.appendChild(n)), i = c(l, a), m ? l.parentNode.removeChild(l) : (n.parentNode.removeChild(n), g.style.overflow = k), !!i
            },
            v = {}.hasOwnProperty,
            w;
        !z(v, "undefined") && !z(v.call, "undefined") ? w = function(a, b) {
            return v.call(a, b)
        } : w = function(a, b) {
            return b in a && z(a.constructor.prototype[b], "undefined")
        }, Function.prototype.bind || (Function.prototype.bind = function(b) {
            var c = this;
            if (typeof c != "function") throw new TypeError;
            var d = s.call(arguments, 1),
                e = function() {
                    if (this instanceof e) {
                        var a = function() {};
                        a.prototype = c.prototype;
                        var f = new a,
                            g = c.apply(f, d.concat(s.call(arguments)));
                        return Object(g) === g ? g : f
                    }
                    return c.apply(b, d.concat(s.call(arguments)))
                };
            return e
        }), o.touch = function() {
            var c;
            return "ontouchstart" in a || a.DocumentTouch && b instanceof DocumentTouch ? c = !0 : u(["@media (", m.join("touch-enabled),("), h, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function(a) {
                c = a.offsetTop === 9
            }), c
        }, o.inlinesvg = function() {
            var a = b.createElement("div");
            return a.innerHTML = "<svg/>", (a.firstChild && a.firstChild.namespaceURI) == n.svg
        };
        for (var C in o) w(o, C) && (t = C.toLowerCase(), e[t] = o[C](), r.push((e[t] ? "" : "no-") + t));
        return e.addTest = function(a, b) {
                if (typeof a == "object")
                    for (var d in a) w(a, d) && e.addTest(d, a[d]);
                else {
                    a = a.toLowerCase();
                    if (e[a] !== c) return e;
                    b = typeof b == "function" ? b() : b, typeof f != "undefined" && f && (g.className += " " + (b ? "" : "no-") + a), e[a] = b
                }
                return e
            }, x(""), i = k = null,
            function(a, b) {
                function l(a, b) {
                    var c = a.createElement("p"),
                        d = a.getElementsByTagName("head")[0] || a.documentElement;
                    return c.innerHTML = "x<style>" + b + "</style>", d.insertBefore(c.lastChild, d.firstChild)
                }

                function m() {
                    var a = s.elements;
                    return typeof a == "string" ? a.split(" ") : a
                }

                function n(a) {
                    var b = j[a[h]];
                    return b || (b = {}, i++, a[h] = i, j[i] = b), b
                }

                function o(a, c, d) {
                    c || (c = b);
                    if (k) return c.createElement(a);
                    d || (d = n(c));
                    var g;
                    return d.cache[a] ? g = d.cache[a].cloneNode() : f.test(a) ? g = (d.cache[a] = d.createElem(a)).cloneNode() : g = d.createElem(a), g.canHaveChildren && !e.test(a) && !g.tagUrn ? d.frag.appendChild(g) : g
                }

                function p(a, c) {
                    a || (a = b);
                    if (k) return a.createDocumentFragment();
                    c = c || n(a);
                    var d = c.frag.cloneNode(),
                        e = 0,
                        f = m(),
                        g = f.length;
                    for (; e < g; e++) d.createElement(f[e]);
                    return d
                }

                function q(a, b) {
                    b.cache || (b.cache = {}, b.createElem = a.createElement, b.createFrag = a.createDocumentFragment, b.frag = b.createFrag()), a.createElement = function(c) {
                        return s.shivMethods ? o(c, a, b) : b.createElem(c)
                    }, a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + m().join().replace(/[\w\-]+/g, function(a) {
                        return b.createElem(a), b.frag.createElement(a), 'c("' + a + '")'
                    }) + ");return n}")(s, b.frag)
                }

                function r(a) {
                    a || (a = b);
                    var c = n(a);
                    return s.shivCSS && !g && !c.hasCSS && (c.hasCSS = !!l(a, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")), k || q(a, c), a
                }
                var c = "3.7.0",
                    d = a.html5 || {},
                    e = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                    f = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                    g, h = "_html5shiv",
                    i = 0,
                    j = {},
                    k;
                (function() {
                    try {
                        var a = b.createElement("a");
                        a.innerHTML = "<xyz></xyz>", g = "hidden" in a, k = a.childNodes.length == 1 || function() {
                            b.createElement("a");
                            var a = b.createDocumentFragment();
                            return typeof a.cloneNode == "undefined" || typeof a.createDocumentFragment == "undefined" || typeof a.createElement == "undefined"
                        }()
                    } catch (c) {
                        g = !0, k = !0
                    }
                })();
                var s = {
                    elements: d.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
                    version: c,
                    shivCSS: d.shivCSS !== !1,
                    supportsUnknownElements: k,
                    shivMethods: d.shivMethods !== !1,
                    type: "default",
                    shivDocument: r,
                    createElement: o,
                    createDocumentFragment: p
                };
                a.html5 = s, r(b)
            }(this, b), e._version = d, e._prefixes = m, e.testStyles = u, g.className = g.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (f ? " js " + r.join(" ") : ""), e
    }(this, this.document),
    function(a, b, c) {
        function d(a) {
            return "[object Function]" == o.call(a)
        }

        function e(a) {
            return "string" == typeof a
        }

        function f() {}

        function g(a) {
            return !a || "loaded" == a || "complete" == a || "uninitialized" == a
        }

        function h() {
            var a = p.shift();
            q = 1, a ? a.t ? m(function() {
                ("c" == a.t ? B.injectCss : B.injectJs)(a.s, 0, a.a, a.x, a.e, 1)
            }, 0) : (a(), h()) : q = 0
        }

        function i(a, c, d, e, f, i, j) {
            function k(b) {
                if (!o && g(l.readyState) && (u.r = o = 1, !q && h(), l.onload = l.onreadystatechange = null, b)) {
                    "img" != a && m(function() {
                        t.removeChild(l)
                    }, 50);
                    for (var d in y[c]) y[c].hasOwnProperty(d) && y[c][d].onload()
                }
            }
            var j = j || B.errorTimeout,
                l = b.createElement(a),
                o = 0,
                r = 0,
                u = {
                    t: d,
                    s: c,
                    e: f,
                    a: i,
                    x: j
                };
            1 === y[c] && (r = 1, y[c] = []), "object" == a ? l.data = c : (l.src = c, l.type = a), l.width = l.height = "0", l.onerror = l.onload = l.onreadystatechange = function() {
                k.call(this, r)
            }, p.splice(e, 0, u), "img" != a && (r || 2 === y[c] ? (t.insertBefore(l, s ? null : n), m(k, j)) : y[c].push(l))
        }

        function j(a, b, c, d, f) {
            return q = 0, b = b || "j", e(a) ? i("c" == b ? v : u, a, b, this.i++, c, d, f) : (p.splice(this.i++, 0, a), 1 == p.length && h()), this
        }

        function k() {
            var a = B;
            return a.loader = {
                load: j,
                i: 0
            }, a
        }
        var l = b.documentElement,
            m = a.setTimeout,
            n = b.getElementsByTagName("script")[0],
            o = {}.toString,
            p = [],
            q = 0,
            r = "MozAppearance" in l.style,
            s = r && !!b.createRange().compareNode,
            t = s ? l : n.parentNode,
            l = a.opera && "[object Opera]" == o.call(a.opera),
            l = !!b.attachEvent && !l,
            u = r ? "object" : l ? "script" : "img",
            v = l ? "script" : u,
            w = Array.isArray || function(a) {
                return "[object Array]" == o.call(a)
            },
            x = [],
            y = {},
            z = {
                timeout: function(a, b) {
                    return b.length && (a.timeout = b[0]), a
                }
            },
            A, B;
        B = function(a) {
            function b(a) {
                var a = a.split("!"),
                    b = x.length,
                    c = a.pop(),
                    d = a.length,
                    c = {
                        url: c,
                        origUrl: c,
                        prefixes: a
                    },
                    e, f, g;
                for (f = 0; f < d; f++) g = a[f].split("="), (e = z[g.shift()]) && (c = e(c, g));
                for (f = 0; f < b; f++) c = x[f](c);
                return c
            }

            function g(a, e, f, g, h) {
                var i = b(a),
                    j = i.autoCallback;
                i.url.split(".").pop().split("?").shift(), i.bypass || (e && (e = d(e) ? e : e[a] || e[g] || e[a.split("/").pop().split("?")[0]]), i.instead ? i.instead(a, e, f, g, h) : (y[i.url] ? i.noexec = !0 : y[i.url] = 1, f.load(i.url, i.forceCSS || !i.forceJS && "css" == i.url.split(".").pop().split("?").shift() ? "c" : c, i.noexec, i.attrs, i.timeout), (d(e) || d(j)) && f.load(function() {
                    k(), e && e(i.origUrl, h, g), j && j(i.origUrl, h, g), y[i.url] = 2
                })))
            }

            function h(a, b) {
                function c(a, c) {
                    if (a) {
                        if (e(a)) c || (j = function() {
                            var a = [].slice.call(arguments);
                            k.apply(this, a), l()
                        }), g(a, j, b, 0, h);
                        else if (Object(a) === a)
                            for (n in m = function() {
                                    var b = 0,
                                        c;
                                    for (c in a) a.hasOwnProperty(c) && b++;
                                    return b
                                }(), a) a.hasOwnProperty(n) && (!c && !--m && (d(j) ? j = function() {
                                var a = [].slice.call(arguments);
                                k.apply(this, a), l()
                            } : j[n] = function(a) {
                                return function() {
                                    var b = [].slice.call(arguments);
                                    a && a.apply(this, b), l()
                                }
                            }(k[n])), g(a[n], j, b, n, h))
                    } else !c && l()
                }
                var h = !!a.test,
                    i = a.load || a.both,
                    j = a.callback || f,
                    k = j,
                    l = a.complete || f,
                    m, n;
                c(h ? a.yep : a.nope, !!i), i && c(i)
            }
            var i, j, l = this.yepnope.loader;
            if (e(a)) g(a, 0, l, 0);
            else if (w(a))
                for (i = 0; i < a.length; i++) j = a[i], e(j) ? g(j, 0, l, 0) : w(j) ? B(j) : Object(j) === j && h(j, l);
            else Object(a) === a && h(a, l)
        }, B.addPrefix = function(a, b) {
            z[a] = b
        }, B.addFilter = function(a) {
            x.push(a)
        }, B.errorTimeout = 1e4, null == b.readyState && b.addEventListener && (b.readyState = "loading", b.addEventListener("DOMContentLoaded", A = function() {
            b.removeEventListener("DOMContentLoaded", A, 0), b.readyState = "complete"
        }, 0)), a.yepnope = k(), a.yepnope.executeStack = h, a.yepnope.injectJs = function(a, c, d, e, i, j) {
            var k = b.createElement("script"),
                l, o, e = e || B.errorTimeout;
            k.src = a;
            for (o in d) k.setAttribute(o, d[o]);
            c = j ? h : c || f, k.onreadystatechange = k.onload = function() {
                !l && g(k.readyState) && (l = 1, c(), k.onload = k.onreadystatechange = null)
            }, m(function() {
                l || (l = 1, c(1))
            }, e), i ? k.onload() : n.parentNode.insertBefore(k, n)
        }, a.yepnope.injectCss = function(a, c, d, e, g, i) {
            var e = b.createElement("link"),
                j, c = i ? h : c || f;
            e.href = a, e.rel = "stylesheet", e.type = "text/css";
            for (j in d) e.setAttribute(j, d[j]);
            g || (n.parentNode.insertBefore(e, n), m(c, 0))
        }
    }(this, document), Modernizr.load = function() {
        yepnope.apply(window, [].slice.call(arguments, 0))
    }, Modernizr.addTest("cssfilters", function() {
        var a = document.createElement("div");
        return a.style.cssText = Modernizr._prefixes.join("filter:blur(2px); "), !!a.style.length && (document.documentMode === undefined || document.documentMode > 9)
    }), Modernizr.addTest("svgfilters", function() {
        var a = !1;
        try {
            a = typeof SVGFEColorMatrixElement !== undefined && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE == 2
        } catch (b) {}
        return a
    });





/*!

 * jQuery imagesLoaded plugin v1.2.3

 * http://github.com/desandro/imagesloaded

 *

 * MIT License. by Paul Irish et al.

 */

;
(function($, undefined) {

    // $('#my-container').imagesLoaded(myFunction)

    // or

    // $('img').imagesLoaded(myFunction)

    // execute a callback when all images have loaded.

    // needed because .load() doesn't work on cached images

    // callback is executed when all images has fineshed loading

    // callback function arguments: $all_images, $proper_images, $broken_images

    // `this` is the jQuery wrapped container

    // returns previous jQuery wrapped container extended with deferred object

    // done method arguments: .done( function( $all_images ){ ... } )

    // fail method arguments: .fail( function( $all_images, $proper_images, $broken_images ){ ... } )

    // progress method arguments: .progress( function( images_count, loaded_count, proper_count, broken_count )

    $.fn.imagesLoaded = function(callback) {
        var $this = this,
            deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
            hasNotify = $.isFunction(deferred.notify),
            $images = $this.find('img').add($this.filter('img')),
            len = $images.length,
            blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            loaded = [],
            proper = [],
            broken = [];

        function doneLoading() {
            var $proper = $(proper),
                $broken = $(broken);
            if (deferred) {
                if (broken.length) {
                    deferred.reject($images, $proper, $broken)
                } else {
                    deferred.resolve($images)
                }
            }
            if ($.isFunction(callback)) {
                callback.call($this, $images, $proper, $broken)
            }
        }

        function imgLoaded(event) {
            if (event.target.src === blank || $.inArray(this, loaded) !== -1) {
                return
            }
            loaded.push(this);
            if (event.type === 'error') {
                broken.push(this)
            } else {
                proper.push(this)
            }
            $.data(this, 'imagesLoaded', event.type);
            if (hasNotify) {
                deferred.notify($images.length, loaded.length, proper.length, broken.length)
            }
            if (--len <= 0) {
                setTimeout(doneLoading);
                $images.unbind('.imagesLoaded', imgLoaded)
            }
        }
        if (!len) {
            doneLoading()
        }
        $images.bind('load.imagesLoaded error.imagesLoaded', imgLoaded).each(function() {
            var cachedEvent = $.data(this, 'imagesLoaded');
            if (cachedEvent) {
                $(this).triggerHandler(cachedEvent);
                return
            }
            var src = this.src;
            this.src = blank;
            this.src = src
        });
        return deferred ? deferred.promise($this) : $this
    }
})(jQuery);

// SmoothScroll for websites v1.2.1

// Licensed under the terms of the MIT license.

// People involved

//  - Balazs Galambosi (maintainer)  

//  - Michael Herf     (Pulse Algorithm)

! function() {
    function e() {
        var e = !1;
        e && c("keydown", r), v.keyboardSupport && !e && u("keydown", r)
    }

    function t() {
        if (document.body) {
            var t = document.body,
                o = document.documentElement,
                n = window.innerHeight,
                r = t.scrollHeight;
            if (S = document.compatMode.indexOf("CSS") >= 0 ? o : t, w = t, e(), x = !0, top != self) y = !0;
            else if (r > n && (t.offsetHeight <= n || o.offsetHeight <= n)) {
                var a = !1,
                    i = function() {
                        a || o.scrollHeight == document.height || (a = !0, setTimeout(function() {
                            o.style.height = document.height + "px", a = !1
                        }, 500))
                    };
                if (o.style.height = "auto", setTimeout(i, 10), S.offsetHeight <= n) {
                    var l = document.createElement("div");
                    l.style.clear = "both", t.appendChild(l)
                }
            }
            v.fixedBackground || b || (t.style.backgroundAttachment = "scroll", o.style.backgroundAttachment = "scroll")
        }
    }

    function o(e, t, o, n) {
        if (n || (n = 1e3), d(t, o), 1 != v.accelerationMax) {
            var r = +new Date,
                a = r - C;
            if (a < v.accelerationDelta) {
                var i = (1 + 30 / a) / 2;
                i > 1 && (i = Math.min(i, v.accelerationMax), t *= i, o *= i)
            }
            C = +new Date
        }
        if (M.push({
                x: t,
                y: o,
                lastX: 0 > t ? .99 : -.99,
                lastY: 0 > o ? .99 : -.99,
                start: +new Date
            }), !T) {
            var l = e === document.body,
                u = function() {
                    for (var r = +new Date, a = 0, i = 0, c = 0; c < M.length; c++) {
                        var s = M[c],
                            d = r - s.start,
                            f = d >= v.animationTime,
                            h = f ? 1 : d / v.animationTime;
                        v.pulseAlgorithm && (h = p(h));
                        var m = s.x * h - s.lastX >> 0,
                            w = s.y * h - s.lastY >> 0;
                        a += m, i += w, s.lastX += m, s.lastY += w, f && (M.splice(c, 1), c--)
                    }
                    l ? window.scrollBy(a, i) : (a && (e.scrollLeft += a), i && (e.scrollTop += i)), t || o || (M = []), M.length ? E(u, e, n / v.frameRate + 1) : T = !1
                };
            E(u, e, 0), T = !0
        }
    }

    function n(e) {
        x || t();
        var n = e.target,
            r = l(n);
        if (!r || e.defaultPrevented || s(w, "embed") || s(n, "embed") && /\.pdf/i.test(n.src)) return !0;
        var a = e.wheelDeltaX || 0,
            i = e.wheelDeltaY || 0;
        return a || i || (i = e.wheelDelta || 0), !v.touchpadSupport && f(i) ? !0 : (Math.abs(a) > 1.2 && (a *= v.stepSize / 120), Math.abs(i) > 1.2 && (i *= v.stepSize / 120), o(r, -a, -i), void e.preventDefault())
    }

    function r(e) {
        var t = e.target,
            n = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey && e.keyCode !== H.spacebar;
        if (/input|textarea|select|embed/i.test(t.nodeName) || t.isContentEditable || e.defaultPrevented || n) return !0;
        if (s(t, "button") && e.keyCode === H.spacebar) return !0;
        var r, a = 0,
            i = 0,
            u = l(w),
            c = u.clientHeight;
        switch (u == document.body && (c = window.innerHeight), e.keyCode) {
            case H.up:
                i = -v.arrowScroll;
                break;
            case H.down:
                i = v.arrowScroll;
                break;
            case H.spacebar:
                r = e.shiftKey ? 1 : -1, i = -r * c * .9;
                break;
            case H.pageup:
                i = .9 * -c;
                break;
            case H.pagedown:
                i = .9 * c;
                break;
            case H.home:
                i = -u.scrollTop;
                break;
            case H.end:
                var d = u.scrollHeight - u.scrollTop - c;
                i = d > 0 ? d + 10 : 0;
                break;
            case H.left:
                a = -v.arrowScroll;
                break;
            case H.right:
                a = v.arrowScroll;
                break;
            default:
                return !0
        }
        o(u, a, i), e.preventDefault()
    }

    function a(e) {
        w = e.target
    }

    function i(e, t) {
        for (var o = e.length; o--;) z[N(e[o])] = t;
        return t
    }

    function l(e) {
        var t = [],
            o = S.scrollHeight;
        do {
            var n = z[N(e)];
            if (n) return i(t, n);
            if (t.push(e), o === e.scrollHeight) {
                if (!y || S.clientHeight + 10 < o) return i(t, document.body)
            } else if (e.clientHeight + 10 < e.scrollHeight && (overflow = getComputedStyle(e, "").getPropertyValue("overflow-y"), "scroll" === overflow || "auto" === overflow)) return i(t, e)
        } while (e = e.parentNode)
    }

    function u(e, t, o) {
        window.addEventListener(e, t, o || !1)
    }

    function c(e, t, o) {
        window.removeEventListener(e, t, o || !1)
    }

    function s(e, t) {
        return (e.nodeName || "").toLowerCase() === t.toLowerCase()
    }

    function d(e, t) {
        e = e > 0 ? 1 : -1, t = t > 0 ? 1 : -1, (k.x !== e || k.y !== t) && (k.x = e, k.y = t, M = [], C = 0)
    }

    function f(e) {
        if (e) {
            e = Math.abs(e), D.push(e), D.shift(), clearTimeout(A);
            var t = D[0] == D[1] && D[1] == D[2],
                o = h(D[0], 120) && h(D[1], 120) && h(D[2], 120);
            return !(t || o)
        }
    }

    function h(e, t) {
        return Math.floor(e / t) == e / t
    }

    function m(e) {
        var t, o, n;
        return e *= v.pulseScale, 1 > e ? t = e - (1 - Math.exp(-e)) : (o = Math.exp(-1), e -= 1, n = 1 - Math.exp(-e), t = o + n * (1 - o)), t * v.pulseNormalize
    }

    function p(e) {
        return e >= 1 ? 1 : 0 >= e ? 0 : (1 == v.pulseNormalize && (v.pulseNormalize /= m(1)), m(e))
    }
    var w, g = {
            frameRate: 150,
            animationTime: 800,
            stepSize: 120,
            pulseAlgorithm: !0,
            pulseScale: 8,
            pulseNormalize: 1,
            accelerationDelta: 20,
            accelerationMax: 1,
            keyboardSupport: !0,
            arrowScroll: 50,
            touchpadSupport: !0,
            fixedBackground: !0,
            excluded: ""
        },
        v = g,
        b = !1,
        y = !1,
        k = {
            x: 0,
            y: 0
        },
        x = !1,
        S = document.documentElement,
        D = [120, 120, 120],
        H = {
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            spacebar: 32,
            pageup: 33,
            pagedown: 34,
            end: 35,
            home: 36
        },
        v = g,
        M = [],
        T = !1,
        C = +new Date,
        z = {};
    setInterval(function() {
        z = {}
    }, 1e4);
    var A, N = function() {
            var e = 0;
            return function(t) {
                return t.uniqueID || (t.uniqueID = e++)
            }
        }(),
        E = function() {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(e, t, o) {
                window.setTimeout(e, o || 1e3 / 60)
            }
        }(),
        K = /chrome/i.test(window.navigator.userAgent),
        L = "onmousewheel" in document;
    L && K && (u("mousedown", a), u("mousewheel", n), u("load", t))
}();
	
	
	/**

 * Theme default js
 */
	
	
	'use strict';

$(document).ready(function(){

  // ------------------- nav animation init -------------------
  navScroll.init();


  // ------------------- matchHeight -------------------
  $('.match-height').matchHeight();

});



// ------------------- ScrollReveal -------------------
window.sr = ScrollReveal({
  duration: 650,
  distance: '25px',
  scale: 0.95
});
sr.reveal('.scrollreveal');



// ------------------- nav animation -------------------
var $header = $('#nav'),
    $headerHeight = $header.height();

var navScroll = {

  init:function(){
    $(window).on('scroll',function(){
      navScroll.navDrop();
    })
  },

  navDrop:function(){
    var $scrollTop = $(window).scrollTop();

    if($scrollTop > $headerHeight){
      $header.addClass('scrolled');
    }
    else if($scrollTop == 0) {
      $header.removeClass('scrolled');
    }
  }
}

define (function(require){

    var _           = require('underscore');
    var Backbone    = require('backbone');
    var d3          = require('d3');

    var NumberFormatter = require('../helpers/NumberFormatter');

    var template =  "<div class='d3Chart-Header'>" +
                        "<a class='icon-zoom-out displayNone'></a>" +
                    "</div>" +
                    "<div class='<%=axisLabelClassName%> xLabel'/>" +
                    "<div class='<%=axisLabelClassName%> yLabel'/>" +
                    "<div class='chartTooltip bottom' style='opacity:0'></div>";

    var tooltipTemplate =   "<div class='arrow'/>" +
                            "<div class = 'tooltip'>" +
                                "<div class='yTooltipLabel'><%= yLabel %></div>" +
                                "<div class='yValue'><%= y %> <div class='yUnits'><%= yUnits %></div></div><br />" +
                                "<div class= 'xTooltipLabel'><%= xLabel %></div>" +
                                "<div class='xValue'><%= x %> <div class='xUnits'><%= xUnits %></div></div>" +
                            "</div>";

    var D3ChartModel = Backbone.Model.extend({

        defaults : {
            xMin:           undefined, //current absolute range (can be adjusted by new data points)
            yMin:           undefined,
            xMax:           undefined,
            yMax:           undefined,
            xMinZoom:       undefined, //zoomed range (changes depending on the zoom level)
            yMinZoom:       undefined,
            xMaxZoom:       undefined,
            yMaxZoom:       undefined,
            xMinDefault:    undefined, //starting / default range (fixed)
            yMinDetault:    undefined,
            xMaxDefault:    undefined,
            yMaxDefault:    undefined,
            xMinRange:      undefined, //minimum allowed range
            yMinRange:      undefined,
            xZoomEnabled:   true,
            yZoomEnabled:   true,
            isZoomed:       false,
            dataset: [],
            functionFormula: undefined,
            isFunctionOfX:   true
        }
    });

    var chartID = 0;

    var D3ChartView = Backbone.View.extend({

        className :'d3ChartView',

        events : {
            'click .icon-zoom-out' : 'resetZoom',
            'mousedown'            : 'onStartDrag'
        },

        initialize: function (options){

            _.bindAll(this, 'onZoomChange', 'onRangeChange', 'onIsZoomedChange', 'onDataChange', 'onFunctionChange',
                'buildChart', 'setupChartAxisLabels', 'setupChart', 'drawRules', 'plotPoints', 'drawLine',
                'removeNewLine', 'drawFocusAxis', 'drawFunction', 'stretchRange', 'isPointInVisualRange', 'setupTooltips',
                'pointMouseOver', 'isEmpty', 'resetZoom', 'getCurrentXMin', 'getCurrentXMax', 'getCurrentYMin', 'getCurrentYMax',
                'setZoom', 'onStartDrag', 'onMoveDrag', 'onEndDrag', 'killDrag', 'drawDrag');

            options = options || {};
            this.chartOptions = {
                width               : options.width             || 300,
                height              : options.height            || 200,
                parentXPosition     : options.parentXPosition   || 450,
                parentYPosition     : options.parentYPosition    || 320,
                numTicks            : options.numTicks          || 10,
                ruleColor           : options.ruleColor         || '#cccccc',
                topPadding          : options.topPadding        || 10,
                leftPadding         : options.leftPadding       || 30,
                rightPadding         : options.rightPadding       || 30,
                bottomPadding       : options.bottomPadding     || 0,
                pointRadius         : options.pointRadius       || 3,
                pointColor          : options.pointColor        || '#000000',
                xLabel              : options.xLabel            || 'x',
                yLabel              : options.yLabel            || 'y',
                xUnits              : options.xUnits            || '',
                yUnits              : options.yUnits            || '',
                functionLineColor   : options.functionLineColor || '#508399',
                focusLineColor      : options.focusLineColor     || '#FF0000',
                functionLineSize    : options.functionLineSize  || 1,
                isLineChart         : options.isLineChart        || false,
                isInterpolated      : options.isInterpolated     || false,
                interpolatedType    : options.interpolatedType   || 'basis',
                showAxisLabels      : options.showAxisLabels     || false,
                axisLabelClassName  : options.axisLabelClassName || '',
                format              : options.format             || NumberFormatter.AstroFormat,
                xAxisFormat         : options.xAxisFormat        || undefined,
                yAxisFormat         : options.yAxisFormat        || undefined
            };

            this.$el.html(_.template(template, {axisLabelClassName: this.chartOptions.axisLabelClassName}));

            this.$zoomOutIcon = this.$('.icon-zoom-out');
            this.$tooltip = this.$('.chartTooltip');

            this.model = new D3ChartModel();
            this.model.set({
                'xMinDefault'   : options.defaultMinX,
                'yMinDefault'   : options.defaultMinY,
                'xMaxDefault'   : options.defaultMaxX,
                'yMaxDefault'   : options.defaultMaxY,
                'xMinZoom'      : options.defaultMinX,
                'yMinZoom'      : options.defaultMinY,
                'xMaxZoom'      : options.defaultMaxX,
                'yMaxZoom'      : options.defaultMaxY,
                'xMinRange'     : options.xMinRange,
                'yMinRange'     : options.yMinRange,
                'xZoomEnabled'  : options.xZoomEnabled,
                'yZoomEnabled'  : options.yZoomEnabled

            });

            this.model.on({
                'change:xMinZoom change:yMinZoom change:xMaxZoom change:yMaxZoom'
                                    : this.onZoomChange,
                'change:xMin change:yMin change:xMax change:yMax'
                                    : this.onRangeChange,
                'change:dataset'    : this.onDataChange,
                'change:isZoomed change:xZoomEnabled change:yZoomEnabled'
                                    : this.onIsZoomedChange,
                'change:functionFormula change:isFunctionOfX'
                                    : this.onFunctionChange
            });

            this.onDataChange();
            this.setupChart();
            this.setupChartAxisLabels();

            this.chartID = chartID++;
        },


        /*----  Model change events  ----*/

        onZoomChange: function (event) {
            var isZoomed;

            var xMinZoom = this.model.get('xMinZoom');
            var xMaxZoom = this.model.get('xMinZoom');
            var yMinZoom = this.model.get('xMinZoom');
            var yMaxZoom = this.model.get('xMaxZoom');

            if (xMinZoom && xMinZoom !== this.model.get('xMin')) { isZoomed = true; }
            if (xMaxZoom && xMaxZoom !== this.model.get('xMax')) { isZoomed = true; }
            if (yMinZoom && yMinZoom !== this.model.get('yMin')) { isZoomed = true; }
            if (yMaxZoom && yMaxZoom !== this.model.get('yMax')) { isZoomed = true; }

            this.model.set('isZoomed', isZoomed);

            this.$zoomOutIcon.toggleClass('displayNone', !isZoomed);

            this.buildChart();
        },

        onRangeChange: function (event) {
            if (!this.model.get('isZoomed')) {
                this.buildChart();
            }
        },

        onIsZoomedChange: function (event) {
            var showZoom = (this.model.get('yZoomEnabled') ||
                            this.model.get('xZoomEnabled')) &&
                            this.model.get('isZoomed');
            this.$zoomOutIcon.toggleClass('displayNone', showZoom);
        },

        onDataChange: function (event) {
            var dataset = this.model.get('dataset');

            var xMin = this.model.get('xMinDefault'),
                xMax = this.model.get('xMaxDefault'),
                yMin = this.model.get('yMinDefault'),
                yMax = this.model.get('yMaxDefault');

            if (this.svg) {
                this.svg.selectAll('circle').remove();
            }

            var self = this;
            if(!this.isEmpty(dataset)){
                _.each(dataset, function(datapoint){
                    xMin = self.stretchRange(xMin, datapoint.x, false);
                    xMax = self.stretchRange(xMax, datapoint.x, true);
                    yMin = self.stretchRange(yMin, datapoint.y, false);
                    yMax = self.stretchRange(yMax, datapoint.y, true);
                });
            }

            this.model.set({
                'xMin': xMin,
                'xMax': xMax,
                'yMin': yMin,
                'yMax': yMax
            });

            if(this.chartOptions.isLineChart){
                this.drawLine(dataset);
            }
            else{
                this.plotPoints(dataset);
            }

        },

        onFunctionChange: function(event) {
            this.drawFunction();
        },


        /*----  Base Charting  ----*/


        buildChart: function(){
            var dataset = this.model.get('dataset');

            if(this.chartOptions.isLineChart) {
                this.setupChart();
                this.drawLine(dataset);
            }
            else {
                this.setupChart();
                this.plotPoints(dataset);
                this.drawFunction();

            }

        },

        setupChartAxisLabels: function () {
            if (this.chartOptions.showAxisLabels){
                this.$('.xLabel').html(this.chartOptions.xLabel);
                this.$('.yLabel').html(this.chartOptions.yLabel);
            }
        },


        setupChart: function(){

            var numTicks      = this.chartOptions.numTicks;
            var color         = this.chartOptions.ruleColor;
            var topPadding    = this.chartOptions.topPadding;
            var leftPadding   = this.chartOptions.leftPadding;
            var rightPadding  = this.chartOptions.rightPadding;
            var bottomPadding = this.chartOptions.bottomPadding;
            var width         = this.chartOptions.width;
            var height        = this.chartOptions.height;

            var xMin = this.getCurrentXMin();
            var xMax = this.getCurrentXMax();
            var yMin = this.getCurrentYMin();
            var yMax = this.getCurrentYMax();

            this.xScale = d3.scale.linear()
                        .domain([xMin,xMax])
                        .range([leftPadding, width - (rightPadding * 2)]);

            this.yScale = d3.scale.linear()
                        .domain([yMin,yMax])
                        .range([height - (topPadding * 2), (topPadding * 2)]);

            var xAxis = d3.svg.axis()
                        .scale(this.xScale)
                        .ticks(numTicks)
                        .orient("bottom");

            if(this.chartOptions.xAxisFormat){
                xAxis.tickFormat(this.chartOptions.xAxisFormat);
            }

            var yAxis = d3.svg.axis()
                        .scale(this.yScale)
                        .ticks(numTicks)
                        .orient("left");

            if(this.chartOptions.yAxisFormat){
                yAxis.tickFormat(this.chartOptions.yAxisFormat);
            }

            if(this.svg){
                this.svg = [];
                this.$('svg').first().remove();
            }

            this.svg = d3.select(this.el)
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height + this.chartOptions.bottomPadding);

            this.svg.append("g")
                        .attr("class","axis")
                        .attr("transform", "translate(0," + (height - (topPadding * 2)) + ")")
                        .call(xAxis);

            this.svg.append("g")
                        .attr("class","axis")
                        .attr("transform","translate(" + (leftPadding) + ",0)")
                        .call(yAxis);

            this.drawRules();

            this.lineGen = d3.svg.line()
                            .interpolate('basis')
                            .x(function(d) {
                                return this.xScale(d[0] ? d[0] : d.x);
                            })
                            .y(function(d) {
                                return this.yScale(d[1] ? d[1] : d.y);
                            });

            if (this.clipPath) {
                this.clipPath.remove();
            }

            this.clipPath = this.svg
                        .append('svg:clipPath')
                        .attr('id', 'lineMask' + this.chartID);

            this.clipPath.append('svg:rect')
                        .attr('width', this.xScale(xMax) - this.xScale(xMin))
                        .attr('height', this.yScale(yMin) - this.yScale(yMax))
                        .attr('fill', '#000000')
                        .attr('transform', 'translate(' + leftPadding + ',' + (topPadding * 2) + ')');

        },


        drawRules: function () {
            var numTicks    = this.chartOptions.numTicks;
            var color       = this.chartOptions.ruleColor;
            var topPadding  = this.chartOptions.topPadding;
            var leftPadding = this.chartOptions.leftPadding;
            var rightPadding  = this.chartOptions.rightPadding;
            var width       = this.chartOptions.width;
            var height      = this.chartOptions.height;

            this.svg.selectAll("line.y")
                        .data(this.yScale.ticks(numTicks))
                        .enter()
                        .insert("line", ":first-child")
                        .attr("class", "yRules")
                        .attr("x1", leftPadding)
                        .attr("x2", width - (rightPadding * 2))
                        .attr("y1", this.yScale)
                        .attr("y2", this.yScale)
                        .style("stroke", color);

            this.svg.selectAll("line.x")
                        .data(this.xScale.ticks(numTicks))
                        .enter()
                        .insert("line", ":first-child")
                        .attr("class", "xRules")
                        .attr("x1", this.xScale)
                        .attr("x2", this.xScale)
                        .attr("y1", topPadding * 2)
                        .attr("y2", height - (topPadding * 2))
                        .style("stroke", color);
        },


        plotPoints : function (dataPoints) {
            var self = this;
            var zoomedDataPoints = [];

            for (var i = 0 ; i < dataPoints.length; i++){
                if (this.isPointInVisualRange(dataPoints[i])) {
                    zoomedDataPoints.push({
                        x : dataPoints[i].x,
                        y : dataPoints[i].y
                    });
                }
            }
            if (!zoomedDataPoints || zoomedDataPoints.length === 0) {
                return;
            }

            var r = this.chartOptions.pointRadius;
            var color = this.chartOptions.pointColor;

            this.svg.selectAll('circle')
                    .data(zoomedDataPoints)
                    .enter()
                    .append("circle")
                    .attr('class', 'plotPoints')
                    .attr("cx", function(d) {
                        return self.xScale(d.x);
                    })
                    .attr("cy", function(d) {
                        return self.yScale(d.y);
                    })
                    .attr("r",r)
                    .attr("fill", color);

            this.setupTooltips();
        },

        drawLine : function (dataPoints) {
            this.removeNewLine();

            this.pathGen = d3.svg.line()

                            .x(function(d) {
                                return this.xScale(d[0] ? d[0] : d.x);
                            })
                            .y(function(d) {
                                return this.yScale(d[1] ? d[1] : d.y);
                            });

            if(this.chartOptions.isInterpolated){
                this.pathGen.interpolate(this.chartOptions.interpolatedType);
            }

            this.newLine = this.svg
                            .append('svg:path')
                            .attr('class', 'newLine')
                            .style('stroke', this.chartOptions.functionLineColor)
                            .style('stroke-width', 1 + 'px')
                            .style('fill', 'none')
                            .attr('d', this.pathGen(dataPoints))
                            .attr('clip-path', 'url(#lineMask' + this.chartID + ')');

        },

        removeNewLine: function () {

            if(this.svg.selectAll('.newLine')) {
                this.svg.selectAll('.newLine').remove();
            }

        },

        drawFocusAxis : function (focusPoints) {

            if(this.focusPointLines){
              _.each(this.focusPointLines, function(focusPointLine){
                focusPointLine.remove();
              });
            }

            this.focusPointLines = [];

            if(this.svg.selectAll('.plotPoints')) {
                this.svg.selectAll('.plotPoints').remove();
            }

            _.each(focusPoints, function(focusPoint){
              var dataPoints = [{x : focusPoint.x , y : this.getCurrentYMin()},
                                {x : focusPoint.x , y : focusPoint.y},
                                {x : this.getCurrentXMin() , y : focusPoint.y}];

              var focusLineGen = d3.svg.line()
                            .x(_.bind(function(d) {
                                return this.xScale(d[0] ? d[0] : d.x);
                            }, this))
                            .y(_.bind(function(d) {
                                return this.yScale(d[1] ? d[1] : d.y);
                            }, this));

              this.focusPointLines.push(this.svg
                            .append('svg:path')
                            .style('stroke', this.chartOptions.focusLineColor)
                            .style("stroke-dasharray", ("3, 3"))
                            .style('stroke-width', this.chartOptions.functionLineSize + 'px')
                            .style('fill', 'none')
                            .attr('class' , 'focusLines')
                            .attr('d', focusLineGen(dataPoints))
                            .attr('clip-path', 'url(#lineMask' + this.chartID + ')'));
            }, this);

            this.plotPoints(focusPoints);
        },

        /*
            @functionFormula    Should be a function such that a=f(b)
            @isFunctionOfX      If true then the functionFormula is being
                                used to calculate y values, i.e y=f(x)
                                If false then it's the opposite; x=f(y)
        */
        drawFunction: function (functionFormula, isFunctionOfX) {
            functionFormula = functionFormula || this.model.get('functionFormula');
            isFunctionOfX = isFunctionOfX || this.model.get('isFunctionOfX');

            if(this.line) {
                this.line.remove();
            }

            if (!functionFormula) {
                return;
            }

            var curvePoints = [];

            var xMin = this.getCurrentXMin();
            var xMax = this.getCurrentXMax();
            var yMin = this.getCurrentYMin();
            var yMax = this.getCurrentYMax();

            var xPixels = (this.xScale(xMax) - this.xScale(xMin)) / 2;
            var yPixels = (this.yScale(yMin) - this.yScale(yMax)) / 2;
            var pixel;

            if (isFunctionOfX) {
                for(pixel=0; pixel<=xPixels; pixel++){
                    var x = pixel * ((xMax - xMin) / xPixels) + xMin;
                    curvePoints.push([x, functionFormula(x)]);
                }
            } else {
                for(pixel=0; pixel<=yPixels; pixel++){
                    var y = pixel * ((yMax - yMin) / yPixels) + yMax;
                    curvePoints.push([functionFormula(y), y]);
                }
            }

            if(!isNaN(curvePoints[1][1])) {
                this.line = this.svg
                            .append('svg:path')
                            .style('stroke', this.chartOptions.functionLineColor)
                            .style('stroke-width', this.chartOptions.functionLineSize + 'px')
                            .style('fill', 'none')
                            .attr('d', this.lineGen(curvePoints))
                            .attr('clip-path', 'url(#lineMask' + this.chartID + ')');
            }
        },


        stretchRange: function (currentRange, rangeComparison, stretchHigher) {
            if (stretchHigher) {
                if (currentRange < rangeComparison) {
                    return rangeComparison;
                }
            } else {
                if (currentRange > rangeComparison) {
                    return rangeComparison;
                }
            }
            return currentRange;
        },

        isPointInVisualRange : function (point, xMin, xMax, yMin, yMax) {
            xMin = xMin || this.getCurrentXMin();
            xMax = xMax || this.getCurrentXMax();
            yMin = yMin || this.getCurrentYMin();
            yMax = yMax || this.getCurrentYMax();

            return !(point.x < xMin || point.x > xMax || point.y < yMin || point.y > yMax);
        },

        setupTooltips : function(){
            var self = this;

            this.svg.selectAll('circle')
                    .on('mouseover', this.pointMouseOver )
                    .on('mouseout', function (d) {
                        self.$tooltip.stop().animate({ opacity: 0 }, 500);
                    });
        },

        pointMouseOver: function (d) {
            var xAxisLabel = '';
            var yAxisLabel = '';

            if(this.chartOptions.showAxisLabels) {
                xAxisLabel = this.chartOptions.xAxisLabel;
                yAxisLabel = this.chartOptions.yAxisLabel;
            }

            var xLabel = this.chartOptions.xLabel;
            var yLabel = this.chartOptions.yLabel;
            var xUnits = this.chartOptions.xUnits;
            var yUnits = this.chartOptions.yUnits;
            var width  = this.chartOptions.width;

            var toolTipPaddingLeft = 30;
            var toolTipPaddingTop = 10;

            this.$tooltip.stop().animate({ opacity: 1 }, 200);

            var left = d3.event.pageX - toolTipPaddingLeft;
            var parentLeft = this.chartOptions.parentXPosition + this.$el.width() - this.$tooltip.width();

            var top = d3.event.pageY + toolTipPaddingTop + this.$tooltip.height();
            var parentBottom = this.chartOptions.parentYPosition + this.$el.height();
            var newTop = d3.event.pageY - this.$tooltip.height() - toolTipPaddingTop;


            this.$tooltip.html(_.template(tooltipTemplate, {
                    xAxisLabel  : xAxisLabel,
                    xLabel      : xLabel,
                    x           : this.chartOptions.format(d.x),
                    xUnits      : xUnits,
                    yAxisLabel  : xAxisLabel,
                    yLabel      : yLabel,
                    y           : this.chartOptions.format(d.y),
                    yUnits      : yUnits
                }))
                .css('left', (left > parentLeft ? parentLeft : left) + 'px')
                .css('top', (top > parentBottom ? newTop : d3.event.pageY + toolTipPaddingTop) + 'px')
                .css('z-index', 10);

            if(top > parentBottom ){
              this.$tooltip.removeClass('bottom').addClass('top');
            }
            else{
              this.$tooltip.removeClass('top').addClass('bottom');
            }
        },

        isEmpty :function (obj) {
            for(var key in obj) {
                if(obj.hasOwnProperty(key)){
                    return false;
                }
            }
            return true;
        },

        resetZoom: function() {
            this.model.set({
                xMinZoom: this.model.get('xMin'),
                xMaxZoom: this.model.get('xMax'),
                yMinZoom: this.model.get('yMin'),
                yMaxZoom: this.model.get('yMax')
            });
        },

        getCurrentXMin: function () {
            return this.model.get('isZoomed') ? this.model.get('xMinZoom') : this.model.get('xMin');
        },

        getCurrentXMax: function () {
            return this.model.get('isZoomed') ? this.model.get('xMaxZoom') : this.model.get('xMax');
        },

        getCurrentYMin: function () {
            return this.model.get('isZoomed') ? this.model.get('yMinZoom') : this.model.get('yMin');
        },

        getCurrentYMax: function () {
            return this.model.get('isZoomed') ? this.model.get('yMaxZoom') : this.model.get('yMax');
        },

        setZoom: function (x1, x2, y1, y2) {
            var xMinNew = x1 < x2 ? x1 : x2;
            var xMaxNew = x1 > x2 ? x1 : x2;
            var yMinNew = y1 < y2 ? y1 : y2;
            var yMaxNew = y1 > y2 ? y1 : y2;
            var xMinRange = this.model.get('xMinRange');
            var yMinRange = this.model.get('yMinRange');

            var xMin = this.model.get('xMin');
            var xMax = this.model.get('xMax');
            var yMin = this.model.get('yMin');
            var yMax = this.model.get('yMax');

            //ensure remains within bounds
            xMinNew = Math.max(xMin,xMinNew);
            xMaxNew = Math.min(xMax,xMaxNew);
            yMinNew = Math.max(yMin,yMinNew);
            yMaxNew = Math.min(yMax,yMaxNew);

            //limit to min-range
            if (xMaxNew - xMinNew < xMinRange) {
                xMinNew = this.getCurrentXMin();
                xMaxNew = this.getCurrentXMax();
            }
            if (yMaxNew - yMinNew < yMinRange) {
                yMinNew = this.getCurrentYMin();
                yMaxNew = this.getCurrentYMax();
            }

            this.model.set({
                xMinZoom: xMinNew,
                xMaxZoom: xMaxNew,
                yMinZoom: yMinNew,
                yMaxZoom: yMaxNew
            });
        },


        /*----  Dragging Functions  ----*/


        onStartDrag: function (e) {
            if(this.model.get('xZoomEnabled') || this.model.get('xZoomEnabled')){
                e.originalEvent.preventDefault();

                var $svg = this.$(' svg');
                $svg.on('mousemove',    this.onMoveDrag);
                $svg.on('mouseup',      this.onEndDrag);
                $svg.on('mouseleave',   this.killDrag);

                this.dragOffsetX1 = e.offsetX;
                this.dragOffsetY1 = e.offsetY;
                this.dragOffsetX2 = e.offsetX;
                this.dragOffsetY2 = e.offsetY;
            }
        },

        onMoveDrag: function (e) {
            e.originalEvent.preventDefault();

            this.dragOffsetX2 = e.offsetX;
            this.dragOffsetY2 = e.offsetY;

            this.drawDrag(this.dragOffsetX1, this.dragOffsetX2, this.dragOffsetY1, this.dragOffsetY2);
        },

        onEndDrag: function (e) {
            e.originalEvent.preventDefault();

            var xZoomEnabled = this.model.get('xZoomEnabled');
            var yZoomEnabled = this.model.get('yZoomEnabled');

            var newX1 = xZoomEnabled ? this.xScale.invert(this.dragOffsetX1) : this.getCurrentXMin();
            var newX2 = xZoomEnabled ? this.xScale.invert(this.dragOffsetX2) : this.getCurrentXMax();
            var newY1 = yZoomEnabled ? this.yScale.invert(this.dragOffsetY1) : this.getCurrentYMin();
            var newY2 = yZoomEnabled ? this.yScale.invert(this.dragOffsetY2) : this.getCurrentYMax();

            this.setZoom(newX1, newX2, newY1, newY2);

            this.killDrag();
        },

        killDrag: function () {
            var $svg = this.$(' svg');
            $svg.off('mouseup');
            $svg.off('mousemove');
            $svg.off('mouseleave');

            if (this.dragRect) {
                this.dragRect.remove();
            }
        },

        drawDrag: function (x1, x2, y1, y2) {
            if (isNaN(x1) || isNaN(x2) || isNaN(y1) || isNaN(y2) || x1 === x2 || y1 === y2) {
                return;
            }
            if (this.dragRect) {
                this.dragRect.remove();
            }

            var xZoomEnabled = this.model.get('xZoomEnabled');
            var yZoomEnabled = this.model.get('yZoomEnabled');

            //NOTE!! units below here are all in pixels
            var xMin = this.xScale(this.getCurrentXMin());
            var xMax = this.xScale(this.getCurrentXMax());
            var yMin = this.yScale(this.getCurrentYMax()); //y is inverted in pixels
            var yMax = this.yScale(this.getCurrentYMin()); //y is inverted in pixels

            var xMinNew = xZoomEnabled ? (x2 > x1 ? x1 : x2) : xMin;
            var xMaxNew = xZoomEnabled ? (x2 < x1 ? x1 : x2) : xMax;
            var yMinNew = yZoomEnabled ? (y2 > y1 ? y1 : y2) : yMin;
            var yMaxNew = yZoomEnabled ? (y2 < y1 ? y1 : y2) : yMax;

            xMinNew = Math.max(xMinNew, xMin);
            xMaxNew = Math.min(xMaxNew, xMax);
            yMinNew = Math.max(yMinNew, yMin);
            yMaxNew = Math.min(yMaxNew, yMax);

            var xMinRange = this.model.get('xMinRange');
            var yMinRange = this.model.get('yMinRange');

            var xRange = this.xScale.invert(xMaxNew) - this.xScale.invert(xMinNew);
            var yRange = this.yScale.invert(yMinNew) - this.yScale.invert(yMaxNew);

            var showingZoomTooSmall = (xRange < xMinRange || yRange < yMinRange);
            var color = showingZoomTooSmall ? '#FF0000' : '#000000';

            var w = Math.max(xMaxNew - xMinNew, 0);
            var h = Math.max(yMaxNew - yMinNew, 0);

            this.dragRect = this.svg.append("svg:rect")
                                    .attr('fill', color)
                                    .attr('width', w)
                                    .attr('height', h)
                                    .attr('transform', 'translate(' + xMinNew + ',' + yMinNew + ')')
                                    .attr('opacity', 0.2);
        }
    });

    return D3ChartView;
});
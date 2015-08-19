var graph = function() {
    this.setupChart = function(){

        var numTicks      =  10;
        var color         =  '#cccccc';
        var topPadding    =  10;
        var leftPadding   =  30;
        var rightPadding  =  30;
        var bottomPadding =  0;
        var width         =  300;
        var height        =  200;

        var xMin = 0;
        var xMax = 100;
        var yMin = 0;
        var yMax = 100;

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

        var yAxis = d3.svg.axis()
                    .scale(this.yScale)
                    .ticks(numTicks)
                    .orient("left");

        if(this.svg){
            this.svg = [];
            this.$('svg').first().remove();
        }

        this.svg = d3.select('.chart')
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height + bottomPadding);

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
                    .attr('id', 'lineMask');

        this.clipPath.append('svg:rect')
                    .attr('width', this.xScale(xMax) - this.xScale(xMin))
                    .attr('height', this.yScale(yMin) - this.yScale(yMax))
                    .attr('fill', '#000000')
                    .attr('transform', 'translate(' + leftPadding + ',' + (topPadding * 2) + ')');

        return this.svg;
    };

    this.drawRules = function () {
        var numTicks      =  10;
        var color         =  '#cccccc';
        var topPadding    =  10;
        var leftPadding   =  30;
        var rightPadding  =  30;
        var bottomPadding =  0;
        var width         =  300;
        var height        =  200;

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
    };

    this.plotPoints = function (dataPoints) {
        var self = this;
        var zoomedDataPoints = [];

        for (var i = 0 ; i < dataPoints.length; i++){
            zoomedDataPoints.push({
                x : dataPoints[i].x,
                y : dataPoints[i].y
            });
        }
        if (!zoomedDataPoints || zoomedDataPoints.length === 0) {
            return;
        }

        var r = 3;
        var color = '#000000';

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
    };


    this.drawProportionalityLine = function (degrees) {

        if (this.line) {
            this.line.remove();
        }
        
        var padding     = 30;

        var rads = degrees * Math.PI/180;
        var invRads = (90 - degrees) * Math.PI/180;

        this.lineDataset = [[0,0]];

        var xScaleRange = 100;
        var yScaleRange = 100;
        var x,y;

        if (degrees === 90) {
            x = 0;
            y = yScaleRange;
        } if (degrees === 0) {
            x = xScaleRange;
            y = 0;
        } else if(degrees != 90 && degrees != 0){
            x = xScaleRange;
            y = yScaleRange * Math.tan(rads);
        }

        if (y > yScaleRange) {
            x = xScaleRange * Math.tan(invRads);
            y = yScaleRange;
        }

        this.lineDataset.push([x,y]);

        this.lineGen = d3.svg.line()
                    .x(function(d) {
                        return this.xScale(d[0]);
                    })
                    .y(function(d) {
                         return this.yScale(d[1]) ;
                    });

        if(isNaN(this.lineDataset[1][1]) === false) {
                
            this.line = this.svg
                        .append('svg:path')
                        .style('stroke', 'steelblue')
                        .style('stroke-width', '2px')
                        .attr('d', this.lineGen(this.lineDataset));   
        }   
    };

    this.hideProportionalityLine = function(v) {
        if(v){
            this.line.style("display", "block");
        }
        else{
            this.line.style("display", "none");
        }
    }
}

window.graph = new graph();
    
    

    







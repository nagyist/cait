'use strict';

import d3 from 'd3';
import _ from 'underscore';


var d3MultiLineChart = {
    _margin: {
        top: 40,
        right: 100,
        bottom: 30,
        left: 130
    },

    create(el, props, series) {
        let svg = d3.select(el).append('svg')
            .attr('class', 'd3')
            .attr('width', props.width)
            .attr('height', props.height)
            .append('g')
            .attr('transform', `translate(${this._margin.left},${this._margin.top})`);

        svg.append('g').attr('class', 'x axis');
        svg.append('g').attr('class', 'y axis');
        svg.append('g').attr('class', 'lines');

        this.update(el, series);
    },

    update(el, series) {
        var scales = this._scales(el, series);
        this._drawAxes(el, scales, series);
        this._drawLines(el, scales, series);
    },

    _scales(el, series) {
        let data = _.values(series);
        var width = el.offsetWidth - this._margin.right - this._margin.left;
        var height = el.offsetHeight - this._margin.top - this._margin.bottom;

        var x = d3.scale.linear()
            .range([0, width])
            .domain([
                d3.min(data, d => { return d3.min(d, c => { return c.year; }); }),
                d3.max(data, d => { return d3.max(d, c => { return c.year; }); }),
            ]);

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([
                0,
                d3.max(data, d => { return d3.max(d, c => { return c.value; }); }),
            ]);

        return {x: x, y: y};
    },

    _drawLines(el, scales, series) {
        let {x, y} = scales;
        let color = d3.scale.category10().
            domain(_.keys(series));

        // Group data by year:
        let years = {};
        _.each(series, (values, key) => {
            values.map(d => {
                years[d.year] = years[d.year] || {year: d.year};
                years[d.year][key] = {value: d.value, type: d.type};
            });
        });
        years = _.values(years);

        let data = color.domain().map(key => {
            return {
                key: key,
                values: years.filter(d => { return d[key] !== undefined; }).map(d => {
                    return {
                        year: d.year,
                        value: d[key].value,
                        type: d[key].type,
                    };
                }),
            };
        });

        let line = d3.svg.line()
            .x(d => { return x(d.year); })
            .y(d => { return y(d.value); });

        let lineContainer = d3.select(el).selectAll('.lines');

        let lines = lineContainer.selectAll('.line')
            .data(data, d => { return d.key; });
        console.log(data);
        // ENTER
        lines.enter().append('path')
            .attr('class', 'line');

        // UPDATE
        lines.attr('d', d => { return line(d.values); })
            .style('stroke', d => { return color(d.key); });

        // REMOVE
        lines.exit().remove();
    },

    _drawAxes(el, scales, series) {
        let xAxis = d3.svg.axis()
            .scale(scales.x)
            .orient('bottom');

        let yAxis = d3.svg.axis()
            .scale(scales.y)
            .orient('left')
            .ticks(5);

        let height = el.offsetHeight - this._margin.top - this._margin.bottom;
        d3.select(el).select('.x.axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        d3.select(el).select('.y.axis')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('GDP in bn $');
    },
};


export { d3MultiLineChart };

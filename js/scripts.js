document.addEventListener('DOMContentLoaded', function () {
    var container = d3.select(".container");

    var treemapSvg = container
        .append("svg")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT);

    var legendSvg = container
    .append("svg")
    .attr("width", LEGEND_WIDTH)
    .attr('class', 'legend')
    .attr('id', 'legend');

    var htmlBody = d3.select("body");
    var tooltip = htmlBody
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'tooltip')
        .style('opacity', 0);

    var fader = function (color) {
        return d3.interpolateRgb(color, '#000')(0.25);
    };

    var color = d3.scaleOrdinal().range(
        LEGEND_COLORS.map(fader)
    );

    var treemap = d3.treemap().size([SVG_WIDTH, SVG_HEIGHT]).paddingInner(1);

    function sumBySize(d) {
        return d.value;
    }

    d3.json(DATA_SOURCE)
        .then((data) => {
            var root = d3
                .hierarchy(data)
                .eachBefore(function (d) {
                    d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
                })
                .sum(sumBySize)
                .sort(function (a, b) {
                    return b.height - a.height || b.value - a.value;
                });

            treemap(root);

            var cell = treemapSvg
                .selectAll('g')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('class', 'group')
                .attr('transform', function (d) {
                    return 'translate(' + d.x0 + ',' + d.y0 + ')';
                });

            cell
                .append('rect')
                .attr('id', function (d) {
                    return d.data.id;
                })
                .attr('class', 'tile')
                .attr('width', function (d) {
                    return d.x1 - d.x0;
                })
                .attr('height', function (d) {
                    return d.y1 - d.y0;
                })
                .attr('data-name', function (d) {
                    return d.data.name;
                })
                .attr('data-category', function (d) {
                    return d.data.category;
                })
                .attr('data-value', function (d) {
                    return d.data.value;
                })
                .attr('fill', function (d) {
                    return color(d.data.category);
                })
                .on('mousemove', function (event, d) {
                    tooltip.style('opacity', 0.9);
                    tooltip
                        .html(
                            'Game: ' +
                            d.data.name +
                            '<br>Console: ' +
                            d.data.category +
                            '<br>Sales: ' +
                            d.data.value
                        )
                        .attr('data-value', d.data.value)
                        .style('left', event.pageX + 10 + 'px')
                        .style('top', event.pageY - 28 + 'px');
                })
                .on('mouseout', function () {
                    tooltip.style('opacity', 0);
                });

            cell
                .append('text')
                .attr('class', 'tile-text')
                .selectAll('tspan')
                .data(function (d) {
                    return d.data.name.split(/(?=[A-Z][^A-Z])/g);
                })
                .enter()
                .append('tspan')
                .attr('x', 4)
                .attr('y', function (d, i) {
                    return 13 + i * 10;
                })
                .text(function (d) {
                    return d;
                });

            var categories = root.leaves().map(function (nodes) {
                return nodes.data.category;
            });
            categories = categories.filter(function (category, index, self) {
                return self.indexOf(category) === index;
            });

            var legendElemsPerRow = Math.floor(LEGEND_WIDTH / LEGEND_H_SPACING);

            var legendElem = legendSvg
                .append('g')
                .attr('transform', 'translate(60,' + LEGEND_OFFSET + ')')
                .selectAll('g')
                .data(categories)
                .enter()
                .append('g')
                .attr('transform', function (d, i) {
                    return (
                        'translate(' +
                        (i % legendElemsPerRow) * LEGEND_H_SPACING +
                        ',' +
                        (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
                            LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
                        ')'
                    );
                });

            legendElem
                .append('rect')
                .attr('width', LEGEND_RECT_SIZE)
                .attr('height', LEGEND_RECT_SIZE)
                .attr('class', 'legend-item')
                .attr('fill', function (d) {
                    return color(d);
                });

            legendElem
                .append('text')
                .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
                .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
                .text(function (d) {
                    return d;
                });
        })
        .catch((err) => console.log(err));
});

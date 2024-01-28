document.addEventListener('DOMContentLoaded', function () {
    var container = d3.select(".container");

    var treemapSvg = container
        .append("svg")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT);

    var legendSvg = container
    .append("svg")
    .attr("width", LEGEND_WIDTH);

    var htmlBody = d3.select("body");
    var tooltip = htmlBody
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'tooltip')
        .style('opacity', 0);

    var fader = function (color) {
        return d3.interpolateRgb(color, '#fff')(0.25);
    };

    var color = d3.scaleOrdinal().range(
        LEGEND_COLORS.map(fader)
    );

    var treemap = d3.treemap().size([SVG_WIDTH, SVG_HEIGHT]).paddingInner(1);

    function sumBySize(d) {
        return d.value;
    }
});

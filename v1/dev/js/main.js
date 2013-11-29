require.config({
    shim: {
        underscore: {
            exports: "_"
        },
        d3 :  {
            exports: "d3"
        },
        colorbrewer :  {
            exports: "colorbrewer"
        }
    },
    paths: {
        jquery:             "../../../../../../_common/js/jquery/jquery-1.8.0.min",
        jqueryqtip:         "../../../../../../_common/js/jquery/jquery.qtip-2.0.1",
        tabNavi:            "../../../../../../_common/js/spon/v0/ui/tabNavigation",
        underscore:         "../../../../../../_common/js/underscore/underscore-1.4.4.min",
        hashchange:         "../../../../../../_common/js/jquery/jquery.hashchange-1.3.amd",
        d3:                 "d3",
        colorbrewer:        "colorbrewer"
    }
});

require(["jquery", "underscore", "hashchange", "interface", "d3", "colorbrewer"],
        function ($, _, jqhash, mSponInterface, d3, colorbrewer) {

    var width = 856,
        height = 1500,
        cellSize = 15; // cell size

    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d");

    var rect = null,
        svg = null;

    function applyFilters(articles, filters) {
        var weekCounts = {};

        rect
            .transition()
            .attr("y", function(d) {
                if (!filters[d.l]) return -100;
                var wc = weekCounts[d.week] || 1;
                weekCounts[d.week] = wc + 1;
                return wc * 3;
            })
            .duration(400);
    }

    function loadArticles() {
        $.getJSON('data/articles_small.json').then(function(data) {
            
            var articles = _.map(_.sortBy(data.results, function(a) {return a.l;}),
                function(d) {
                    d.week = week(new Date(d.d));
                    return d;
                });

            var topics = _.uniq(_.pluck(articles, 'l')),
                filters = {};

            _.each(topics, function(t) {
                filters[t] = true;
            });

            var color = d3.scale.ordinal()
                .domain(topics)
                .range(colorbrewer.PiYG[9]);
            
            var weekCounts = {};

            var topicList = d3.select('.topics').selectAll('li')
                    .data(topics)
                .enter()
                    .append('li')
                    .style('background', function(d) { return color(d); })
                    .html(function(d) { return d; })
                    .on('click', function(d, idx) {
                        filters[d] = !filters[d];
                        topicList
                            .style('background', function(d) {
                                var c = color(d);
                                return filters[d] ? c : d3.rgb(c).darker(2);
                            });
                        applyFilters(articles, filters);

                    });
            
            rect = svg.selectAll(".article")
                    .data(articles)
                .enter().append("rect")
                    .attr("class", "article")
                    .attr("width", cellSize)
                    //.attr("height", 0)
                    .attr('title', function(d) { return d.t; })
                    .style("fill", function(d) { return color(d.l); })
                    .attr("x", function(d) { return d.week * (cellSize + 3); })
                    //.attr("y", 0)
                    //.datum(format)
                    //.transition()
                    //.duration(1000)
                    .attr("y", function(d) {
                        var wc = weekCounts[d.week] || 1;
                        weekCounts[d.week] = wc + 1;
                        return wc * 3;
                    })
                    .attr("height", 3);

            /*
            rect.style('fill', function(d) { return color(0); });
            rect.filter(function(d) { return d in values; })
                    .style("fill", function(d) { return color(values[d]); })
                .select("title")
                    .text(function(d) { return d + ": " + values[d]; });
            */
        });
    }

    function route(path) {
        loadArticles();
    }

    function init() {
        mSponInterface.init();

        var days = d3.time.days(new Date(2013, 0, 1), new Date(2013 + 1, 0, 1)),
            months = d3.time.months(new Date(2013, 0, 1), new Date(2013 + 1, 0, 1));

        svg = d3.select('.graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }

    $(document).ready(function(){
        init();
        $(window).hashchange(function(e) {
            var path = window.location.hash.substring(1);
            route(path);
            e.defaultPrevented = true;
        });

        $(window).hashchange();
    });
});

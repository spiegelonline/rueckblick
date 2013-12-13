require.config({
    shim: {
        underscore: {
            exports: "_"
        },
        d3 :  {
            exports: "d3"
        }
    },
    paths: {
        jquery:             "../../../../../../_common/js/jquery/jquery-1.8.0.min",
        jqueryqtip:         "../../../../../../_common/js/jquery/jquery.qtip-2.0.1",
        tabNavi:            "../../../../../../_common/js/spon/v0/ui/tabNavigation",
        underscore:         "../../../../../../_common/js/underscore/underscore-1.4.4.min",
        hashchange:         "../../../../../../_common/js/jquery/jquery.hashchange-1.3.amd",
        d3:                 "d3"
    }
});

require(["jquery", "underscore", "hashchange", "interface", "d3"],
        function ($, _, jqhash, mSponInterface, d3) {

    var sponPalette = _.map(['#09336f', '#0c6e0c', '#ff9900', '#70451e', '#b70013', '#62335f',
                       '#06234c', '#014d01', '#f9830e', '#a30415', '#5e3310', '#4fb4c'], function(c) {
                        return d3.rgb(c).brighter(1);
                       });

    var ttemp = _.template($('#tooltip-template').html());

    var width = 856,
        height = 1500,
        cellSize = 15; // cell size

    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d");

    var rect = null,
        svg = null;

    function applyFilters(bytopic, filters) {
        var weekOffsets = {};
        
        rect.transition()
            .duration(function(d, t, w) {
                return w * 20;
            })
            .attr("height", function(d, t, w) {
                var h = bytopic[w][d].length * 3;
                weekOffsets[w] = weekOffsets[w] || [];
                weekOffsets[w][t] = t > 0 ? weekOffsets[w][t-1] : 0;
                if (!filters[d]) return 0;
                weekOffsets[w][t] += h;
                return h;
            })
            .attr("y", function(d, t, w) {
                //if (!filters[d]) return 0;
                return t > 0 ? weekOffsets[w][t-1] : 0;
            });
    }

    function loadArticles() {
        $.getJSON('data/articles_small.json').then(function(data) {
            
            var articles = _.map(data.data,
                function(d) {
                    var o = {};
                    _.each(_.zip(data.fields, d), function(e) {
                        o[e[0].id] = e[1];
                    });
                    o.week = parseInt(week(new Date(o.d)), 10);
                    return o;
                });

            articles = _.sortBy(articles, function(a) {return a.l;});

            var bytopic = {};
            _.each(articles, function(a) {
                bytopic[a.week] = bytopic[a.week] || {};
                bytopic[a.week][a.l] = bytopic[a.week][a.l] || [];
                bytopic[a.week][a.l].push(a);
            });

            var topics = _.uniq(_.pluck(articles, 'l')),
                filters = {};

            _.each(topics, function(t) {
                filters[t] = true;
            });

            var color = d3.scale.ordinal()
                .domain(topics)
                .range(sponPalette);
            
            
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
                        applyFilters(bytopic, filters);

                    });

            var weeks = svg.selectAll('.week')
                    .data(d3.keys(bytopic))
                .enter().append('g')
                    .attr('week', function(d) { return d; })
                    .attr('class', 'week');

            var weekOffsets = {};

            var tooltip = d3.select('#tooltip');

            rect = weeks.selectAll('.topic')
                    .data(function(d) { return d3.keys(bytopic[d]); })
                .enter().append('rect')
                    .attr('class', 'topic');

            rect.attr("width", cellSize)
                    .attr("x", function(d, t, w) { return w * (cellSize + 2); })
                    .style("fill", function(d) { return color(d); })
                    .attr("y", 0)
                    .attr("height", 0)
                    .on('mouseover', function(d, t, w) {
                        var rect = d3.event.target.getBoundingClientRect();
                        var idx = Math.floor((d3.event.pageY - rect.top) / 3) - 1;
                        var y = d3.event.y || d3.event.pageY;
                        var o = bytopic[w][d][idx];
                        //console.log(d3.event);
                        tooltip.html(ttemp({'i': null, 'o': o}))
                            .style('top', y + 'px')
                            .style('left', rect.right + 'px')
                            .style('display', 'block');
                        //console.log(o);
                        if (o.i!==null) {
                            var dfd = $.getJSON('/jsapi/assetlist/image/'+o.i+'-thumbflexhp.json');
                            dfd.done(function(d) {
                                var html = ttemp({'i': d[o.i], 'o': o});
                                tooltip.html(html);
                            });
                        }
                        
                    })
                    .on('mouseout', function(d, t, w) {
                        tooltip.style('display', 'none');
                    })
                    .on('click', function(d, t, w) {
                        var rect = d3.event.target.getBoundingClientRect();
                        var idx = Math.floor((d3.event.pageY - rect.top) / 3) - 1;
                        window.open('http://spiegel.de/artikel/a-' + bytopic[w][d][idx].n + '.html', '_blank');
                    })
                    .transition()
                    .duration(function(d, t, w) {
                        //console.log(t, w);
                        return w * 40;
                    })
                    .attr("height", function(d, t, w) {
                        var h = bytopic[w][d].length * 3;
                        weekOffsets[w] = weekOffsets[w] || [];
                        weekOffsets[w][t] = t > 0 ? weekOffsets[w][t-1] : 0;
                        weekOffsets[w][t] += h;
                        return h;
                    })
                    .attr("y", function(d, t, w) {
                        return t > 0 ? weekOffsets[w][t-1] : 0;
                    });
            console.log("BOBBY!");

            var grid = svg.selectAll('.grid')
                .data(_.range(0, height, 3))
                .enter().append('rect')
                    .attr('class', 'grid')
                    .attr('x', 0)
                    .attr('width', width)
                    .attr('height', 1)
                    .attr('y', function(d) { return d; });

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

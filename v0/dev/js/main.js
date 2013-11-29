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
        height = 136,
        cellSize = 15; // cell size

    var $title = $('#title'),
        $description = $('#description'),
        $switches = $('.switches .switch-button');

    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d");

    var rect = null,
        svg = null;


    function loadTopic(name) {
        $.getJSON('data/' + name + '.json').then(function(data) {
            //console.log(data);
            // TODO: handle 'meta'
            $title.html(data.meta.title);
            $description.html(data.meta.description);
            $switches.removeClass('active');
            $switches.filter('*[data-topic="' + name + '"]').addClass('active');

            var values = {};
            _.each(data.results, function(e) {
                values[e.date] = e.num_articles;
            });

            var color = d3.scale.linear()
                .domain(d3.extent(_.values(values)))
                .range(["white", "red"])
                .interpolate(d3.interpolateHcl);

            /*
            var z = d3.scale.ordinal()
                .domain(d3.extent(_.values(values)))
                .range(colorbrewer.RdBu[9]);
            */
            rect.style('fill', function(d) { return color(0); });
            rect.filter(function(d) { return d in values; })
                    .style("fill", function(d) { return color(values[d]); })
                .select("title")
                    .text(function(d) { return d + ": " + values[d]; });

        });
    }

    function route(path) {
        if (!path.length) {
                path = 'nsa';
        }
        console.log(path);
        loadTopic(path);
    }

    // cf. http://bl.ocks.org/mbostock/4063318
    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = +day(t0), w0 = +week(t0),
          d1 = +day(t1), w1 = +week(t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
            "H" + w0 * cellSize + "V" + 7 * cellSize +
            "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
            "H" + (w1 + 1) * cellSize + "V" + 0 +
            "H" + (w0 + 1) * cellSize + "Z";
    }

    function init() {
        mSponInterface.init();

        var days = d3.time.days(new Date(2013, 0, 1), new Date(2013 + 1, 0, 1)),
            months = d3.time.months(new Date(2013, 0, 1), new Date(2013 + 1, 0, 1));

        svg = d3.select('.graph')
            .append('svg')
            .attr('width',width)
            .attr('height', height);

        rect = svg.selectAll(".day")
                .data(function() { return days; })
            .enter().append("rect")
                .attr("class", "day")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", function(d) { return week(d) * cellSize; })
                .attr("y", function(d) { return day(d) * cellSize; })
                .datum(format);

        rect.append("title")
            .text(function(d) { return d; });

        svg.selectAll(".month")
                .data(function() { return months; })
            .enter().append("path")
                .attr("class", "month")
                .attr("d", monthPath);

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

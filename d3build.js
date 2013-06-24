(function() {

    var width = 1000,
        height = 600,
        radius = Math.min(width, height) / 3,
        color = d3.scale.category20(),
        colorText = d3.scale.category20b(),
        pieLayer, centerLayer, barLayer, arc,
        obj, currentData, defaultBrowser, arr = [];

    //общий svg для для диаграмм
    var layer = d3.select(".main").append("svg")
        .attr("width", width)
        .attr("height", height);


    createBarchart (parsedData);

    //построение столбчатой диаграммы
    function createBarchart (data) {
        var n = 0,
            sum, total, persentage;

        defaultBrowser = true;

        barLayer = layer.append("g")
            .attr("transform", "translate(" + width/2 + "," + height/2.5 + ")");

            barLayer.append("text")
                .attr("class", "bar-header")
                .attr("x", "150")
                .attr("y", -15)
                .attr("text-anchor", "middle")
                .text('Браузеры');
            barLayer.append("text")
                .attr("class", "bar-header")
                .attr("x", "300")
                .attr("y", -15)
                .attr("text-anchor", "middle")
                .text('% посещений');

        Object.keys(data).forEach(function(element) {

            obj = data[element];

            currentData = data;

            sum = summary(obj);

            total = findTotal(data);

            persentage = findPercentage(total, sum);

            arr = fillArray(obj, sum);

            n = n+30;

            if (defaultBrowser) {
                drawPie(arr, element);
                defaultBrowser = false;
            }

            //необходимо ассоциировать диаграмму с данными
            var barGroup = barLayer.data([obj]).append("g");

            barGroup.append("text")
                .attr("class", "link " + element)
                .attr('name', element)
                .attr("x", "150")
                .attr("y", n)
                .attr("text-anchor", "middle")
                .style("fill", function() {return colorText(element) })
                .text(function() {return showNormalName(element)})
                .on("click", function() {
                    var attr = this.getAttribute("name");
                    var currentBrowser;

                    //строим круговую диаграмму по совпавшим данным
                    d3.entries(currentData).forEach(function() {
                        if (element === attr) {
                            var arr = fillArray(currentData[element], summary(currentData[element]));
                            currentBrowser = element;
                            pieLayer.remove();
                            centerLayer.remove();
                            drawPie(arr, currentBrowser);
                        }
                    });
                })
                .on("mouseover", function(d) {
                    d3.select(this.nextSibling).text(summary(d));
                })
                .on("mouseout", function() {
                    d3.select(this.nextSibling).text(persentage+'%');
                });

            barGroup.append("text")
                .attr("class", "numder")
                .attr("x", "400")
                .attr("y", n)
                .attr("text-anchor", "middle")
                .style("fill", 'grey')
                .text(persentage+'%');

            barGroup.append("rect")
                .attr("fill", "#eee")
                .attr("x", 250)
                .attr("y", n-15)
                .attr("width", 100)
                .attr("height",20);

            barGroup.append("rect")
                .style("fill", function() {return colorText(persentage) })
                .attr("x", "250")
                .attr("y", n-15)
                .attr('width', 0)
                .transition()
                .ease("elastic")
                .duration(3000)
                .attr("width", persentage)
                .attr("height",20);
        });
    }

    //построение круговой диаграммы
    function drawPie(arr, element) {

        var posFactor = null;
        var hoverText, pos;

        //анимация каждого отрезка('арки') диаграммы
        function tweenPie(b) {
            b.innerRadius = 0;
            var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
            return function(t) {
                return arc(i(t));
            };
        }

        //коэфициент отдаления(подписи,линии) от диаграммы
        function countLabelPosition(current) {
            if(current < 0.01){
                posFactor = 45;
            }else if(current < 0.1 && (posFactor == 30)){
                posFactor = 60;
            }else{
                posFactor = 30;
            }
            return posFactor;
        }

        pieLayer = layer.data([arr])
            .append('g')
            .attr("transform", "translate(" + width/3.5 + "," + height/1.8 + ")");

        arc = d3.svg.arc()
            .outerRadius(radius -10)
            .innerRadius(radius/1.7);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.value; });

        var arcGroup = pieLayer.selectAll(".arc")
            .data(pie)
            .enter().append("g")
            .attr("class", "arc")
            .attr("d", arc)
            .on('mouseover', function(d) {
                var thisArc = d3.select(this);

                arcGroup.selectAll("path").style('opacity', '0.5');
                arcGroup.selectAll("text").style('opacity', '0.3');
                thisArc.selectAll("path").style('opacity', '1');
                thisArc.selectAll("text").style('opacity', '1');

                hoverText = centerLayer.append("g")
                    .attr('class', 'version');
                hoverText.append('text')
                    .style("text-anchor", "middle")
                    .attr("dy",-200)
                    .transition()
                    .ease("elastic")
                    .delay(100)
                    .attr("dy", 40)
                    .style('fill', '#666')
                    .text('Версия: '+ d.data.named);
                hoverText.append('text')
                    .style("text-anchor", "middle")
                    .attr("dy",-200)
                    .transition()
                    .ease("elastic")
                    .delay(500)
                    .attr("dy", 55)
                    .style('fill', '#666')
                    .text('Посещений: '+ d.value);
            })
            .on('mouseout', function(d) {
                arcGroup.selectAll("path").style('opacity', '1');
                arcGroup.selectAll("text").style('opacity', '1');
                hoverText.remove();
            });

        arcGroup.append("path")
            .style("stroke", "White" )
            .style("fill", function(d) { return color(d.data.named) })
            .attr("d", arc)
            .transition()
            .ease("bounce")
            .duration(2000)
            .delay(function(d, i) { return i * 50; })
            .attrTween("d", tweenPie);

        centerLayer = layer.append("g")
            .attr("class", "center")
            .attr("transform", "translate(" + width/3.5 + "," + height/1.8 + ")");

        centerLayer.append("text")
            .attr("dy", -25)
            .style("text-anchor", "middle")
            .attr('class', 'header')
            .text(function(d){
                return showNormalName(element);
            });
        centerLayer.append("text")
            .attr("dy", 0)
            .style("text-anchor", "middle")
            .style('fill', '#515151')
            .attr('class', 'summary')
            .text('Общее число посещений:');
        centerLayer.append("text")
            .text(summary(obj))
            .attr("dy", 15)
            .style('fill', '#515151')
            .style("text-anchor", "middle")
            .attr('class', 'summary');

        arcGroup.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", -radius+4)
            .attr("y2", -radius-20)
            .attr("stroke", "gray")
            .transition()
            .duration(3000)
            .attr("transform", function(d) { return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")"; })
            .attr("y1", -radius+4)
            .attr("y2",  function(d) {
                var arcWidth = d.endAngle - d.startAngle;
                countLabelPosition(arcWidth);
                return -radius-posFactor+8;
            });

        //полупрозрачная подложка под подписи,
        // так как для svg элемента <text> нельзя задать фон
        arcGroup.append("line")
            .attr("x1", function(d) { return (d.endAngle + d.startAngle)/2 > Math.PI
                ? -20
                : 20;
            })
            .attr("x2", function(d) { return (d.endAngle + d.startAngle)/2 > Math.PI
                ? -20
                : 20;
            })
            .style('stroke-opacity', 0.6)
            .attr("y2", 8)
            .attr('y1', -8)
            .attr("stroke", "#fff")
            .attr("transform", function(d) {
                var arcWidth = d.endAngle - d.startAngle;
                countLabelPosition(arcWidth);
                pos = d3.svg.arc().innerRadius(radius + posFactor).outerRadius(radius + posFactor);
                return "translate(" + pos.centroid(d) + ")";
            })
            .attr("stroke-width", 40);

        arcGroup.append("text")
            .style('opacity', 0)
            .transition()
            .duration(2000)
            .style('opacity', 1)
            .text(function(d) { return d.data.percent+'%'; })
            .attr("transform", function(d) {
                var arcWidth = d.endAngle - d.startAngle;

                //отдалять подписи от диаграммы по мере их плотности
                countLabelPosition(arcWidth);
                pos = d3.svg.arc().innerRadius(radius + posFactor).outerRadius(radius + posFactor);
                return "translate(" + pos.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .attr('class', 'arc-label')
            .attr("text-anchor", function(d) { return (d.endAngle + d.startAngle)/2 > Math.PI
                ? "end"
                : "start";
            });
    }

    d3.select('.mobile')
        .on('click', function(){
            pieLayer.remove();
            centerLayer.remove();
            barLayer.remove();
            createBarchart (parsedDatamob);
        });
    d3.select('.desktop')
        .on('click', function(){
            pieLayer.remove();
            centerLayer.remove();
            barLayer.remove();
            createBarchart (parsedData);
        });
})();
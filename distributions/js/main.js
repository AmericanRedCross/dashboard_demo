var prcDistributions = [];
var maxDate;
var minDate;
var chartData = [];
var categoryData = {};
var categoryTotal = 0;
var itemsCategory;
var categoryList = ["Blankets", "MosquitoNet", "PlasticSleepingMat", "Jerry_10L", "Jerry_20L", "HygieneKit", "KitchenSet", "Tarpaulin","Tent","SRK"];
var donorList = [];
var donorButtons;
var visibleDonors;

function getDistributionData(){
  $.ajax({
      type: 'GET',
      url: 'data/PRC_Distributions.json',
      contentType: 'application/json',
      dataType: 'json',
      timeout: 10000,
      success: function(json) {
        prcDistributions = json;        
        getRanges();
      },
      error: function(e) {
          console.log(e);
      }
  });
}



function getRanges(){
  var allDates = [];
  $(prcDistributions).each(function(i, distribution){
    var selected = distribution.DATE;
    var selectedDate = new Date(selected);
    allDates.push(selectedDate);
    var donorName = distribution.DONOR;
    if (donorList.indexOf(donorName) === -1){
        donorList.push(donorName);
    }; 
  });
  maxDate = new Date(Math.max.apply(null, allDates));
  minDate = new Date(Math.min.apply(null, allDates));
  buildDonorFilter();
}

//       if (isFinite(x) == true){
//         y += x;
//       };

function buildDonorFilter(){
  
  var donorFilterHtml = '<button id="ALL-DONORS" class="btn btn-sm btn-donor filtering all" type="button" onclick="toggleDonorFilter('+"'ALL-DONORS'"+', this);"'+
      ' style="margin-right:10px;">All<span class="glyphicon glyphicon-check" style="margin-left:4px;"></span></button>';
  $.each(donorList, function(index, donor){
    var itemHtml = '<button id="'+donor+'" class="btn btn-sm btn-donor" type="button" onclick="toggleDonorFilter('+"'"+donor+"'"+', this);">'+donor+
        '<span class="glyphicon glyphicon-unchecked" style="margin-left:4px;"></span></button>';
    donorFilterHtml += itemHtml;    
  });
  $('#donorButtons').html(donorFilterHtml);
  donorButtons = $("#donorButtons").children();

  buildHistory();

}

function toggleDonorFilter (filter, element) {
  // check if filter is for all
  if($(element).hasClass('all')){
    $.each(donorButtons, function(i, button){
      $(button).children().removeClass("glyphicon-check");
      $(button).children().addClass("glyphicon-unchecked");
      $(button).removeClass("filtering");
    })
    $(element).children().removeClass("glyphicon-unchecked"); 
    $(element).children().addClass("glyphicon-check");
    $(element).addClass("filtering");         
  } else {
      // clear the ALL filter for the filter category
      var donorAllFilter = $('#donorButtons').find('.all');
      $(donorAllFilter).children().addClass("glyphicon-unchecked");
      $(donorAllFilter).children().removeClass("glyphicon-check");
      $(donorAllFilter).removeClass("filtering");
      
      // if clicked sector filter is on, then turn it off
      if($(element).hasClass("filtering") === true){
        $(element).removeClass("filtering");
        $(element).children().removeClass("glyphicon-check");
        $(element).children().addClass("glyphicon-unchecked");
          // if no sector filters are turned on, toggle 'All' back on
          var noSectorFiltering = true;
          $.each(donorButtons, function(i, button){
            if ($(button).hasClass("filtering")){
              noSectorFiltering = false;
            }
          });
          if (noSectorFiltering === true){
            $(donorAllFilter).children().removeClass("glyphicon-unchecked"); 
            $(donorAllFilter).children().addClass("glyphicon-check");
            $(donorAllFilter).addClass("filtering");     
          }
      // if clicked sector filter is off, then turn it on
    } else {
      $(element).addClass("filtering");
      $(element).children().removeClass("glyphicon-unchecked");
      $(element).children().addClass("glyphicon-check");                
    }
  }
  buildHistory();
}
  




function buildHistory (){

  //check to see what filters are active
  visibleDonors = [];
  $.each(donorButtons, function(i, button){
    if($(button).hasClass("filtering")){
      var buttonid = $(button).attr("id");
      visibleDonors.push(buttonid);
    }
  });

	chartData = [];
  $(categoryList).each(function(i, category){
    categoryTotal = 0;
    categoryData = {};
    itemsCategory = category;
    categoryData.key = category;
    categoryData.values = [];
    for (var d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      $(prcDistributions).each(function(i, distribution){
          var selectedDonor = distribution.DONOR;
          if((new Date(distribution.DATE)).getTime() == d.getTime()){
            if(visibleDonors.indexOf("ALL-DONORS") != -1 || visibleDonors.indexOf(selectedDonor) != -1 ){
              categoryTotal += distribution[itemsCategory];
            }           
          }        
      });
      currentDate = new Date(d);
      categoryData.values.push([currentDate.getTime(), categoryTotal]);
    }
    chartData.push(categoryData);
  });
  buildChart();
}

function buildChart(){
  $('#chart1').empty();
    /*
  .map(function(series) {
    series.values = series.values.map(function(d) {
      return { x: d[0], y: d[1] }
    });
    return series;
  });
  */

  //an example of harmonizing colors between visualizations
  //observe that Consumer Discretionary and Consumer Staples have
  //been flipped in the second chart
  var colors = d3.scale.category20();
  keyColor = function(d, i) {return colors(d.key)};

  var chart;
  nv.addGraph(function() {
    chart = nv.models.stackedAreaChart()
                  .margin({right:30})
                 // .width(600).height(500)
                  .useInteractiveGuideline(true)
                  .x(function(d) { return d[0] })
                  .y(function(d) { return d[1] })
                  .color(keyColor)
                  .transitionDuration(300);
                  //.clipEdge(true);

  // chart.stacked.scatter.clipVoronoi(false);

    chart.xAxis
        .tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });

    chart.yAxis
        .tickFormat(d3.format(',.0f'));

    d3.select('#chart1')
      .datum(chartData)
      .transition().duration(1000)
      .call(chart)
      // .transition().duration(0)
      .each('start', function() {
          setTimeout(function() {
              d3.selectAll('#chart1 *').each(function() {
                console.log('start',this.__transition__, this)
                // while(this.__transition__)
                if(this.__transition__)
                  this.__transition__.duration = 1;
              })
            }, 0)
        })
      // .each('end', function() {
      //         d3.selectAll('#chart1 *').each(function() {
      //           console.log('end', this.__transition__, this)
      //           // while(this.__transition__)
      //           if(this.__transition__)
      //             this.__transition__.duration = 1;
      //         })});

    nv.utils.windowResize(chart.update);

    // chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

    return chart;
  });

  // nv.addGraph(function() {
  //   var chart = nv.models.stackedAreaChart()
  //                 .x(function(d) { return d[0] })
  //                 .y(function(d) { return d[1] })
  //                 .color(keyColor)
  //                 ;
  //                 //.clipEdge(true);

  //   chart.xAxis
  //       .tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });

  //   chart.yAxis
  //       .tickFormat(d3.format(',.2f'));

  //   d3.select('#chart2')
  //     .datum(histcatexpshort)
  //     .transition()
  //       .call(chart);

  //   nv.utils.windowResize(chart.update);

  //   return chart;
  // });
}




getDistributionData();




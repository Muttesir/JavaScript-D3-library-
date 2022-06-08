function plotGraph(inputParam){
    //console.log(inputParam);
    //Data getting from  my github as csv from my github hist you can see link below.
    //let inputParam = "Customer age" is first of dropdown menu;
    //d3.selectAll("svg").remove();
    let myLoop = document.getElementById("zone");
    myLoop.innerHTML = '';
    let yparam;
    let mincalval,maxcalVal;
    switch(inputParam){
    case 'Customer age':
        yparam = 'Customer_Age';
        mincalval = 5;
        maxcalVal = 5;	
        break;
    case 'Credit limit':
        yparam = 'Credit_Limit';
        mincalval = 1500;
        maxcalVal = 1500;
        break;
    case 'Total revolving balance':
        yparam = 'Total_Revolving_Bal';
        mincalval = 750;
        maxcalVal = 750;
        break;
    case 'Total transaction amount':
        yparam = 'Total_Trans_Amt';
        mincalval = 250;
        maxcalVal = 250;
        break;
    case 'Total transaction count':
        yparam = 'Total_Trans_Ct';
        mincalval = 75;
        maxcalVal = 75;
        break;
    case 'Avg. utilization ratio':
        yparam = 'Avg_Utilization_Ratio';
        mincalval = 2.5;
        maxcalVal = 2.5;
        break;
    }
    
    let data = d3.csv("https://gist.githubusercontent.com/Muttesir/42b3467d0ba0c0c36f2308835c4a8c84/raw/a2069fae2bde8ea63c077bcaa67bee8ad8fe3ccc/BankDataset.csv",function(data){
        
     // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
        data.forEach(function(d) {
            d.Customer_Age = parseInt(d.Customer_Age);
            d.Credit_Limit = parseInt(d.Credit_Limit);
            d.Total_Revolving_Bal = parseInt(d.Total_Revolving_Bal);
            d.Total_Trans_Amt = parseInt(d.Total_Trans_Amt);
            d.Total_Trans_Ct = parseInt(d.Total_Trans_Ct);
            
        });
        // nest function allows to group the calculation per level of a factor
        let sumstat = d3.nest() 
          .key(function(d) { return d.Attrition_Flag;})
          .rollup(function(d) {
              
            q1 = d3.min(d.map(function(g) { return g[yparam];}))
            median = d3.median(d.map(function(g) { return g[yparam];}))
            q3 = d3.max(d.map(function(g) { return g[yparam];}))
            interQuantileRange = q3 - q1
            // min & max for Customer Age
             min = q1 - mincalval
            max = (+q3 + +maxcalVal) 
           
            return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
          })
          .entries(data);
        //console.log(sumstat);
        let maxVal = (sumstat[0].value.max > sumstat[1].value.max)?sumstat[0].value.max:sumstat[1].value.max;
        let minVal = (sumstat[0].value.min > sumstat[1].value.min)?sumstat[0].value.min:sumstat[1].value.min;
        //console.log('maxVal :'+maxVal);
        //console.log('minVal :'+minVal);
        
        // Margin of Chart
        let margin = {top: 10, right: 20, bottom: 70, left: 100},
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;


        // append the svg object to the body of the page
        let sVg = d3.select("#zone")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          // translate this svg element to leave some margin.
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // X scale and Axis
        let doMin ,doMax ;
        //let doMin = min - mincalval,doMax = +max + +maxcalVal;//min & Max for Customer Age
        
        switch(inputParam){
        case 'Total revolving balance':
            doMin = minVal ,doMax = +maxVal + +500;
            break;
        case 'Total transaction amount':
            doMin = 0 ,doMax = +maxVal + +2000;
            break;
        case 'Avg. utilization ratio':
            doMin = minVal ,doMax = maxVal;
            break;
        default:
            doMin = minVal - mincalval, doMax = +maxVal + +maxcalVal;
            break;
        }
        
            
            
        // Showing the Y scale
          let y = d3.scaleBand()
            .range([ height, 0 ])
            .domain(["Existing Customer", "Attrited Customer"])
            .padding(.4);
          sVg.append("g")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove()

          // Showing the X scale
          let x = d3.scaleLinear()
            .domain([doMin,doMax])
            .range([0, width])
          sVg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(6))
            .select(".domain").remove()
            
            
          // Color scale
          let myColor = d3.scaleSequential()
            .interpolator(d3.interpolateInferno)
            .domain([doMin,doMax])
            
         // Add X axis label:
            sVg.append("text")
                .attr("text-anchor", "end")
                .attr('font-family', 'cursive')
                .attr('font-size', 15)
                .attr("x", width)
                .attr("y", height + margin.top + 30)
                .text(inputParam);
         // Show the main vertical line
            sVg
              .selectAll("vertLines")
              .data(sumstat)
              .enter()
              .append("line")
                .attr("x1", function(d){return(x(d.value.min))})
                .attr("x2", function(d){return(x(d.value.max))})
                .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
                .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
                .attr("stroke", "red")
                .attr('stroke-width', 3)
                .style("width", 40)
                
             // rectangle for the main box
                sVg
                  .selectAll("boxes")
                  .data(sumstat)
                  .enter()
                  .append("rect")
                      .attr("x", function(d){return(x(d.value.q1))}) // console.log(x(d.value.q1)) ;
                      .attr("width", function(d){ ; return(x(d.value.q3)-x(d.value.q1))}) //console.log(x(d.value.q3)-x(d.value.q1))
                      .attr("y", function(d) { return y(d.key); })
                      .attr("height", y.bandwidth() )
                      .attr("stroke", "blue")
                      .attr('stroke-width', 2)
                      .style("fill", "#f7b563")
                      .style("opacity", 0.5)
              // Show the median
              sVg
                .selectAll("medianLines")
                .data(sumstat)
                .enter()
                .append("line")
                  .attr("y1", function(d){return(y(d.key))})
                  .attr("y2", function(d){return(y(d.key) + y.bandwidth()/1)})
                  .attr("x1", function(d){return(x(d.value.median))})
                  .attr("x2", function(d){return(x(d.value.median))})
                  .attr("stroke", "red")
                  .attr('stroke-width', 2)
                  .style("width", 40)
                  
           // create a tooltip//
          let tooltip = d3.select("#zone")
            .append("div")
              .style("opacity", 0)
              .attr("class", "tooltip")
              .style('font-family', 'cursive')
              .style("font-size", "24px")
              
              
              
          // Three function that change the tooltip when user hover / move / leave a cell
      let mouseover = function(d) {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1)
        tooltip
            .html("<span style='color:white'>"+inputParam+": </span>" + d[yparam]) // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
            .style("left", (d3.mouse(this)[0]+30) + "px")
            .style("top", (d3.mouse(this)[1]+30) + "px")
      }
      let mousemove = function(d) {
        tooltip
          .style("left", (d3.mouse(this)[0]+30) + "px")
          .style("top", (d3.mouse(this)[1]+30) + "px")
      }
      let mouseleave = function(d) {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      }

      // Add individual points with jitter
      let jitterWidth = 50
      sVg
        .selectAll("indPoints")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d){ return(x(d[yparam]))})
          .attr("cy", function(d){ return( y(d.Attrition_Flag) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth )})
          .attr("r", 4)
          .style("fill", function(d){ return(myColor(+d[yparam])) })
          .attr("stroke", "black")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
                            
    });
    
    
    
}
$(document).ready(function(e){
    plotGraph('Customer age');
    $('#option').on('change', function(e) {
          
          plotGraph(this.value);
    });
});

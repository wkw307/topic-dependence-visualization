var width = document.getElementById('content').offsetWidth;
var height = document.getElementById('content').offsetHeight;
var svg = d3.select('div#content').append('svg')
  .attr('width', '100%')
  .attr('height', '100%')
  // .append('g');
// console.log(g);
svg.append('circle')
  .style('fill', 'gray')
  .attr('r', width/2)
  .attr('cx', width/2)
  .attr('cy', height/2);

var width = document.getElementById('content').offsetWidth;
var height = document.getElementById('content').offsetHeight;
var svg = d3.select('div#content').append('svg')
  .attr('width', '100%')
  .attr('height', '100%');
var defs = svg.append("defs");
 
var arrowMarker = defs.append("marker")
  .attr("id","arrow")
  .attr("markerUnits","strokeWidth")
  .attr("markerWidth","8")
  .attr("markerHeight","8")
  .attr("viewBox","0 0 12 12") 
  .attr("refX","6")
  .attr("refY","6")
  .attr("orient","auto");
 
// var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";						
arrowMarker.append("path")
  .attr("d",arrow_path)
  .attr("fill", "#000");

var link = d3.line()
  .x(function(d){return d.x})
  .y(function(d){return d.y})
  .curve(d3.curveCatmullRom.alpha(0.5));

var topics = [
  '104814', '104837',
  '104841', '104842',
  '104843'
];
var links = {
  '104814': undefined,
  '104837': [ '104841', '104814', '104843' ],
  '104841': [ '104842', '104843' ],
  '104842': undefined,
  '104843': undefined
};

var topics0 = [
  '104794', '104796',
  '104801', '104812',
  '104814', '104817',
  '104833', '104837',
  '104841', '104843',
  '104842'
];
var links0 = {
  '104794': undefined,
  '104796': undefined,
  '104801': undefined,
  '104812': undefined,
  '104814': [ '104817' ],
  '104817': undefined,
  '104833': undefined,
  '104837': [ '104841', '104794', '104814', '104843' ],
  '104841': [ '104842', '104833', '104812', '104796', '104843' ],
  '104842': [ '104801' ],
  '104843': undefined
};

var topics2 = [
  '104814', '104817',
  '104837','104794',
  '104841','104796','104812','104833',
  '104842','104801', '104843'
];
let circles;
function CircleLayout(svg, topics, width, height, cx, cy, outer, i){
  if(outer){
    var count = topics.length;
    var r = Math.sin(Math.PI/count) * width / 2 / (1 + Math.sin(Math.PI/count));
    var R = width / 2;
    var angle = Math.PI * 2 / count;
    r = r * 7 / 10;
    // svg.append('circle')
    //   .style('fill', '#B7B7B7')
    //   .attr('r', width/2)
    //   .attr('cx', cx)
    //   .attr('cy', cy);
    circles = svg.append('g')
      .selectAll('circle')
      .data(topics)
      .enter()
      .append('circle')
      .attr('r', r)
      .attr('cx', function(d,i){
        return cx + (R -r) * Math.sin(angle * i) * 19 / 20;
      })
      .attr('cy', function(d,i){
        return cy - (R - r) * Math.cos(angle * i) * 19 / 20;
      })
      .attr('fill', '#B7B7B7');
    for(let i = 0; i < circles._groups[0].length; i++){
      let cx = parseFloat(circles._groups[0][i].attributes.cx.value);
      let cy = parseFloat(circles._groups[0][i].attributes.cy.value);
      svg.append('g')
        .append('text')
        .attr('x', cx)
        .attr('y', cy)
        .attr('font-size', '2em')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.5em')
        .text(topics[i]);
    }
    // for(let com in communityLinks){
    //   if(communityLinks[com] !== undefined){
    //     for(let endcom of communityLinks[com]){
    for(let com in links0){
      if(links0[com] !== undefined){
        for(let endcom of links0[com]){
          // let startIndex = processedCommunity.indexOf(com);
          // let endIndex = processedCommunity.indexOf(endcom);
          // let startIndex = communities.indexOf(com);
          // let endIndex = communities.indexOf(endcom);
          let startIndex = topics.indexOf(com);
          let endIndex = topics.indexOf(endcom);
          let r = parseFloat(circles._groups[0][startIndex].attributes.r.value);
          let cx1 = parseFloat(circles._groups[0][startIndex].attributes.cx.value);
          let cy1 = parseFloat(circles._groups[0][startIndex].attributes.cy.value);
          let cx2 = parseFloat(circles._groups[0][endIndex].attributes.cx.value);
          let cy2 = parseFloat(circles._groups[0][endIndex].attributes.cy.value);
          let linkData = caculateLinkSourceTargetBetweenCircles(cx1,cy1,r,cx2,cy2,r);
          
          // console.log(linkData)
          svg.append('path')
            .attr('d', link(linkData))
            .attr('stroke', '#878787')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrow)');
        }
      }
    }
  }else{
    var count = topics.length;
    var r = Math.sin(Math.PI/count) * width / 2 / (1 + Math.sin(Math.PI/count));
    var R = width / 2;
    var angle = Math.PI * 2 / count;
    r = r * 7 / 10;
    let cs = svg.append('g')
      .selectAll('circle')
      .data(topics)
      .enter()
      .append('circle')
      .attr('r', r)
      .attr('cx', function(d,i){
        return cx + (R -r) * Math.sin(angle * i) * 19 / 20;
      })
      .attr('cy', function(d,i){
        return cy - (R - r) * Math.cos(angle * i) * 19 / 20;
      })
      .attr('fill', '#878787');
    // let topicS = processedTopics[i];
    // let linkS = linksInCommunity[i];
    let topicS = topicsGroupByCommunityId[(i+1).toString()];
    let linkS = linksInCommunity[(i+1).toString()];
    for(let topic in linkS){
      if(linkS[topic] !== undefined){
        for(let endtopic of linkS[topic]){
          let startIndex = topicS.indexOf(topic);
          let endIndex = topicS.indexOf(endtopic);
          let r = parseFloat(cs._groups[0][startIndex].attributes.r.value);
          let cx1 = parseFloat(cs._groups[0][startIndex].attributes.cx.value);
          let cy1 = parseFloat(cs._groups[0][startIndex].attributes.cy.value);
          let cx2 = parseFloat(cs._groups[0][endIndex].attributes.cx.value);
          let cy2 = parseFloat(cs._groups[0][endIndex].attributes.cy.value);
          let linkData = caculateLinkSourceTargetBetweenCircles(cx1,cy1,r,cx2,cy2,r);
          // console.log(linkData)
          svg.append('path')
            .attr('d', link(linkData))
            .attr('stroke', '#5A5A5A')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrow)');
        }
      }
    }
  }


  // var link = d3.line()
  //   .x(function(d){return d.x})
  //   .y(function(d){return d.y})
  //   .curve(d3.curveCatmullRom.alpha(0.5));
  // var linkData = [{'x': 100, 'y': 100},{'x': 200, 'y': 250}, {'x': 300, 'y': 300}];
  // var lineGraph = svg.append('path')
  //                   .attr('d', link(linkData))
  //                   .attr('stroke', 'blue')
  //                   .attr('stroke-width', 2)
  //                   .attr('fill', 'none');

}
CircleLayout(svg, topics2, width, height, width/2, height/2, true);
/*
// 处理前
CircleLayout(svg, communities, width, height, width/2, height/2, true);
// 处理后
// CircleLayout(svg, processedCommunity, width, height, width/2, height/2, true);
for(let i = 0; i < processedCommunity.length; i++){
  // console.log(i)
  let cx = parseFloat(circles._groups[0][i].attributes.cx.value);
  let cy = parseFloat(circles._groups[0][i].attributes.cy.value);
  let r = parseFloat(circles._groups[0][i].attributes.r.value);
  // 处理前
  CircleLayout(svg, topicsGroupByCommunityId[(i+1).toString()], r * 2, r * 2, cx, cy, false, i);
  // 处理后
  // CircleLayout(svg, topicsGroupByCommunityId[processedCommunity[i]], r * 2, r * 2, cx, cy, false, processedCommunity[i]);
  // console.log(circles._groups[0][i].attributes.cx.value)
}
*/
// console.log(topicsGroupByCommunityId['7']);
// topic1 = detectEdgeCrossing(topicsGroupByCommunityId['7'], linksInCommunity['7']);
// console.log(topic1);
// topic2 = detectEdgeCrossing(topic1, linksInCommunity['7']);
// console.log(topic2);
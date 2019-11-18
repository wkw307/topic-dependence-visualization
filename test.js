var R = require('r-script');
var out = R("./rscript/communityDiscovery.r")
    .data("hello world", 20)
    .callSync();

console.log(out);
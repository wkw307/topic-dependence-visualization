import * as R from 'r-script';

var out = R('/rscript/communityDiscovery.r').data('aaaaa', 'bbbbb')
    .callSync();
console.log(out);
import axios from 'axios';
import {drawMap} from "./src/draw-map";

axios.get('http://yotta.xjtushilei.com:8083/dependency/getDependenciesByDomainName?domainName=C语言')
    .then(res => {
        const data = res.data.data;
        const svg = document.getElementById('map');
        drawMap(svg, data);
    })
    .catch(error => {
        console.log(error);
    });
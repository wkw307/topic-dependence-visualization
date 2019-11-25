import { calCommunity, parseAPI, preProcess} from "../src";

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/parseAPI', (req, res) => {
    res.send(parseAPI(req.body));
});

app.post('/preProcess', (req, res) => {
    res.send(preProcess(req.body.topics, req.body.relations));
});

app.post('/calCommunity', (req, res) => {
    const {rpath, topics, relations, output} = req.body;
    res.send(calCommunity(path.join(__dirname, rpath), topics, relations, path.join(__dirname, output)));
});

app.listen(port, () => console.log(`listening on port ${port}`));
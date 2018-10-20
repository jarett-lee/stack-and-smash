const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.port || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile("/", {root: 'public'});
});

app.get('/*.*', (req, res) => {
    res.sendFile(`${req.params[0]}.${req.params[1]}`, { root: 'public' });
})

app.listen(port, () => {
    console.log("Listening on port", port);
});

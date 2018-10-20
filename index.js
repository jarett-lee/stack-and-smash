const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.port || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    console.log("Listening on port", port);
})

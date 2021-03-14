const express = require('express')
const spawn  = require('cross-spawn');
const path = require('path')


const startServer = (queryInfos) => {
    const app = express()
    console.log(__dirname, '..', 'client')
    const ls = spawn('npm', ['run', 'dev'],{ cwd: path.resolve(__dirname, '..', 'client')});
    ls.stdout.on('data', (data) => {
        console.log(`Client: ${data}`);
      });
    ls.on('error', console.log)

    app.get('/tracingInfos', (req, res) => {
        console.log('???')
        return res.send(queryInfos)
    })

    app.get('/tracingInfos/:id', (req, res) => {
        return res.send(queryInfos[req.params.id])
    })

    app.listen(5000, () => {
        console.log(`Middleware Server listing on ${5000}!`)
    })
}

module.exports = startServer
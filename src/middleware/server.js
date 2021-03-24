const express = require('express')
const spawn  = require('cross-spawn');
const path = require('path')


const startServer = (queryInfos, errors) => {
    const app = express()
    console.log(__dirname, '..', 'client')
    const ls = spawn('npm', ['run', 'dev'],{ cwd: path.resolve(__dirname, '..', 'client')});
    ls.stdout.on('data', (data) => {
        console.log(`Client: ${data}`);
      });
    ls.on('error', console.log)

    app.get('/tracingInfos', (req, res) => {
        console.log('???')
        return res.send({ infos: queryInfos, errors: errors })
    })

    app.get('/tracingInfos/:id', (req, res) => {
        return res.send(JSON.stringify({ infos: queryInfos[req.params.id] || null, errors: errors[req.params.id] || null }))
    })

    app.listen(5000, () => {
        console.log(`Middleware Server listing on ${5000}!`)
    })
}

module.exports = startServer
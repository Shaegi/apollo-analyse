const express = require('express')
const spawn  = require('cross-spawn');
const path = require('path')


const startServer = (queryInfos, errors, db) => {
    const app = express()
    // Start Next.js client
    const ls = spawn('npm', ['run', 'dev'],{ cwd: path.resolve(__dirname, '..', 'client')});
    ls.stdout.on('data', (data) => {
        console.log(`Client: ${data}`);
      });
    ls.on('error', console.log)

    app.get('/tracingInfos', (req, res) => {
        const operations = db.get('operations').value()
        return res.send({ infos: operations, errors: errors })
    })

    app.get('/tracingInfos/:id', (req, res) => {
        const operations = db.get('operations').get(req.params.id)
        return res.send(JSON.stringify({ infos: operations || null, errors: errors[req.params.id] || null }))
    })

    app.listen(5000, () => {
        console.log(`Middleware Server listing on ${5000}!`)
    })
}

module.exports = startServer
const bodyParser = require('body-parser');
const {pool, credentials} = require('./database/pool.js')
const Express = require('express');
const app = Express();
const cors = require('cors');
let server = require('http').createServer();
const handlerFunc = require('./handler.js')
const handler = handlerFunc.handler()

const start = async () => {

    app.use(cors())

        /*// Starts up the database and logs startup to console
        console.log(`Master ${process.pid} is running`);

        // Creates Node.js worker instances on all cores
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        app.use(bodyParser.json({ limit: '10mb' }));

        if (process.env.NODE_ENV == 'development') {
            app.use(cors())
        }

        //Request handlers right here
        app.post('/createMoat', handler.createMoat)
        app.post('/raw', handler.query)
        app.post('/storePhoto', handler.storePhoto)
        app.post('/storeFile', handler.storeFile)
        app.get('/raw', handler.query)
        //app.use(Express.static('public', { fallthrough: false }));

        //Create a bundle table
        await pool.query(`CREATE TABLE IF NOT EXISTS bundles(
            bundle_id varchar(43) PRIMARY KEY,
            height integer NOT NULL,
            cursor_id varchar(44) NOT NULL,
            synced boolean NOT NULL,
            moat varchar(64) NOT NULL
          );`)

        //Create pending bundle table
        await pool.query(`CREATE TABLE IF NOT EXISTS pending_bundles(
            bundle_id text,
            moats text[]
        )`)*/

    app.use(bodyParser.json({ limit: '10mb' }));

    app.post('/addMoat', handler.addMoat)

    app.post('/addSecret', handler.addSecret)
    app.post('/getMoats', handler.getMoats)
    app.post('/getSecrets', handler.getSecrets)
    app.post('/getEncryptedAPIKey', handler.getEncryptedAPIKey)
    app.post('/updateSecret', handler.updateSecret)

    await pool.query(`CREATE TABLE IF NOT EXISTS registry(
        moat varchar(64) PRIMARY KEY,
        api_key varchar NOT NULL,
        secret varchar NOT NULL,
        owner varchar(42) NOT NULL
      );`)

    await pool.query(`CREATE TABLE IF NOT EXISTS secrets(
        id SERIAL PRIMARY KEY,
        moat varchar(64) NOT NULL,
        secret varchar NOT NULL,
        timestamp bigint NOT NULL
        );`)

    server.on('request', app);
    server.listen(process.env.NODE_PORT, function () {
        console.log(`The thing is running on ${process.env.NODE_PORT}`)
    })

}

start();
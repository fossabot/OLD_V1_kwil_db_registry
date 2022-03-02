const bodyParser = require('body-parser');
const {pool, credentials} = require('./database/pool.js')
const Express = require('express');
const app = Express();
const cors = require('cors');
let server = require('http').createServer();
const handlerFunc = require('./handler.js')
const handler = handlerFunc.handler()
const fundingPools = require('./fundingPools.json')
const Web3 = require('web3')
const abi = require('./abi.json')

const start = async () => {
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
    //app.post('/addSecret', handler.addSecret)
    app.post('/getMoats', handler.getMoats)
    app.post('/getSecrets', handler.getSecrets)
    app.post('/getEncryptedAPIKey', handler.getEncryptedAPIKey)
    //app.post('/updateSecret', handler.updateSecret)
    app.post('/getFundingPools', handler.getFundingPools)
    const options = {
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 30000, // ms
            maxAttempts: 1000,
            onTimeout: false
        }
    };
    //const endpoint = "wss://goerli-light.eth.linkpool.io/ws"
    const wsGoerli = new Web3.providers.WebsocketProvider('wss://eth-goerli.alchemyapi.io/v2/7ugsfAn1P2ei1mI5Kj48L6kXourgUeTL', options)
    const web3Goerli = new Web3(wsGoerli)
    const contractAddrGoerli = "0x6c1B59FE7F955E8F3DcCD703c80d32c83B6a52c6"
    const contractGoerli = new web3Goerli.eth.Contract(abi.abi, contractAddrGoerli)
    //const endpointPolygon = "wss://rpc-mainnet.matic.network"wss://mainnet.infura.io/ws wss://polygon-mainnet.g.alchemy.com/v2/rmHrTewIiEOvqSby9ApxY3nnhTOVP4G-
    const wsPolygon = new Web3.providers.WebsocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/rmHrTewIiEOvqSby9ApxY3nnhTOVP4G-', options)
    const web3Polygon = new Web3(wsPolygon)
    const contractAddrPolygon = "0x2669eC7028A3ab5C7179b8f69448A3CC8d89f9E1"
    const contractPolygon = new web3Polygon.eth.Contract(abi.abi, contractAddrPolygon)
    const web3PolygonKRED = new Web3(wsPolygon)
    const contractAddrPolygonKRED = "0x23B9a7DbdE896fb6b3Aa14dBB492Df9945C0DACe"
    const contractPolygonKRED = new web3Polygon.eth.Contract(abi.abi, contractAddrPolygonKRED)
    /*const wsEth = new Web3.providers.WebsocketProvider('wss://eth-mainnet.alchemyapi.io/v2/y3Z3J_eAb86DAynqgmQ8b43_9HP2Z5zy', options)
    const web3Eth = new Web3(wsEth)
    const contractAddrEth = "0xb0c780AdCC7C4316bCAea764e39472a01a43C866"
    const contractEth = new web3Eth.eth.Contract(abi.abi, contractAddrEth)*/
    await pool.query(`CREATE TABLE IF NOT EXISTS registry(
        moat varchar(64) PRIMARY KEY,
        api_key varchar NOT NULL,
        secret varchar NOT NULL,
        owner varchar(200) NOT NULL
      );`)

    await pool.query(`CREATE TABLE IF NOT EXISTS secrets(
        id SERIAL PRIMARY KEY,
        moat varchar(64) NOT NULL,
        secret varchar NOT NULL,
        timestamp bigint NOT NULL
        );`)
    await pool.query(`CREATE TABLE IF NOT EXISTS funding_pools(
        id varchar(260) PRIMARY KEY,
        pool_name varchar(250),
        creator varchar(200) NOT NULL,
        validator varchar(200) NOT NULL,
        moat varchar(64) NOT NULL,
        blockchain varchar(30) NOT NULL
      );`)
    /*await pool.query(`CREATE TABLE IF NOT EXISTS goerli(
        pool_name varchar(250) PRIMARY KEY,
        creator varchar(200) NOT NULL,
        validator varchar(200) NOT NULL
      );`)
    await pool.query(`CREATE TABLE IF NOT EXISTS polygon(
        pool_name varchar(250) PRIMARY KEY,
        creator varchar(200) NOT NULL,
        validator varchar(200) NOT NULL
      );`)*/
    //Goerli listener
    contractGoerli.events.PoolCreated({})
        .on('data', async function(event){
            try {
                console.log(event.returnValues);
                const id = event.returnValues.poolName + '_goerli_USDC';
                const query = 'INSERT INTO funding_pools (id,pool_name, creator, validator,moat,blockchain) VALUES ($1,$2,$3,$4,$5,$6);'
                const values = [`${id}`,`${event.returnValues.pool}`,`${event.returnValues.creator}`,`${event.returnValues.validator}`,`${event.returnValues.moatName}`,`goerli`];
                await pool.query(query, values);
            }catch(e){
                console.log(e)
            }
        })
        .on('error', console.error);
    //CHANGE VARIABLES FOR THESE FUNCTION TO MATCH

    //Polygon listener
    contractPolygon.events.PoolCreated({})
        .on('data', async function(event){
            try {
                console.log(event.returnValues);
                const id = event.returnValues.poolName + '_polygon_USDC';
                const query = 'INSERT INTO funding_pools (id,pool_name, creator, validator,moat,blockchain) VALUES ($1,$2,$3,$4,$5,$6);'
                const values = [`${id}`,`${event.returnValues.pool}`,`${event.returnValues.creator}`,`${event.returnValues.validator}`,`${event.returnValues.moatName}`,`polygon`];
                await pool.query(query, values);
            }catch(e){
                console.log(e)
            }
        })
        .on('error', console.error);
    //Polygon listener KRED
    contractPolygonKRED.events.PoolCreated({})
        .on('data', async function(event){
            try {
                console.log(event.returnValues);
                const id = event.returnValues.poolName + '_polygon_KRED';
                const query = 'INSERT INTO funding_pools (id,pool_name, creator, validator,moat,blockchain) VALUES ($1,$2,$3,$4,$5,$6);'
                const values = [`${id}`,`${event.returnValues.pool}`,`${event.returnValues.creator}`,`${event.returnValues.validator}`,`${event.returnValues.moatName}`,`polygon`];
                await pool.query(query, values);
            }catch(e){
                console.log(e)
            }
        })
        .on('error', console.error);
    //Ethereum mainnet listener
    /*contractEth.events.MoatCreated({})
        .on('data', async function(event){
            try {
                console.log(event.returnValues);
                const id = event.returnValues.moatName + '_ethereum';
                const query = 'INSERT INTO funding_pools (id,pool_name, creator, validator) VALUES ($1,$2,$3,$4);'
                const values = [`${id}`,`${event.returnValues.moatName}`,`${event.returnValues.creator}`,`${event.returnValues.validator}`];
                await pool.query(query, values);
            }catch(e){
                console.log(e)
            }
        })
        .on('error', console.error);*/
    server.on('request', app);
    server.listen(process.env.NODE_PORT, function () {
        console.log(`The thing is running on ${process.env.NODE_PORT}`)
    })

}
start();


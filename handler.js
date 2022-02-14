const {pool} = require("./database/pool");
const Web3 = require('web3');


const handler = () => {
    class Handler {
        constructor() {

        }

        async addMoat(req, res) {
            try {
                console.log(req);
                const data = req.body;
                console.log(data);
                console.log('moat');
                const query = 'INSERT INTO registry(moat, api_key, owner, secret) VALUES ($1,$2,$3,$4);'
                const values = [`${data.moat}`,`${data.apiKey}`,`${data.owner}`,`${data.secret}`];
                await pool.query(query,values);
            }
            catch(e){
                console.log(e);
            }
            res.end();
        }

        async addSecret(req, res) {
            try {
                console.log(req);
                const data = req.body;
                console.log(data);
                const query = 'INSERT INTO secrets (moat, secret, timestamp) VALUES ($1,$2,$3);'
                const values = [`${data.moat}`,`${data.secret}`,`${data.timestamp}`];
                await pool.query(query,values);
            }
            catch(e){
                console.log(e);
            }
            res.end();
        }

        async getMoats(req, res) {
            try {
                console.log(req);
                const data = req.body;
                console.log(data);
                const query = 'SELECT * FROM registry WHERE owner = $1;'
                const values = [`${data.owner}`];
                const result = await pool.query(query,values);
                console.log(result.rows);
                res.send(result.rows);
            }
            catch(e){
                console.log(e);
                res.end();
            }
        }

        async getSecrets(req, res) {
            try {
                console.log(req);
                const data = req.body;
                console.log(data);
                const query = 'SELECT secret, timestamp FROM secrets WHERE moat=$1;'
                const values = [`${data.moat}`];
                const result = await pool.query(query,values);
                console.log(result.rows);
                res.send(result.rows);
            }catch(e){
                console.log(e);
                res.end();
            }
        }

        async getEncryptedAPIKey(req, res) {
            try {
                console.log(req);
                const data = req.body;
                console.log(data);
                const query = 'SELECT api_key FROM registry WHERE moat = $1;'
                const values = [`${data.moat}`];
                const result = await pool.query(query,values);
                console.log(result.rows);
                res.send(result.rows);
            }catch(e){
                console.log(e);
                res.end();
            }
        }

        async updateSecret(req, res) {
            try {
                const web3 = new Web3();
                console.log(req);
                const data = req.body;
                console.log(data);
                const query = 'SELECT api_key, owner FROM registry WHERE moat = $1;'
                const values = [`${data.moat}`]
                const encryptedAPI = await pool.query(query,values);
                console.log(encryptedAPI.rows);
                if (encryptedAPI.rows.length > 0) {
                    const address = web3.eth.accounts.recover(encryptedAPI.rows[0].api_key, data.sig)
                    if (address == encryptedAPI.rows[0].owner) {
                        await pool.query(`UPDATE registry
                                          SET secret = '${data.secret}'
                                          WHERE moat = '${data.moat}';`)
                        res.send('success');
                    } else {
                        res.send('failed, wrong signature')
                    }
                } else {
                    res.send('moat doesnt exist')
                }
            }
            catch(e){
                console.log(e);
            }
            /*const result = await pool.query(`SELECT api_key FROM registry WHERE moat='${data.moat}';`)
            console.log(result.rows);
            res.send(result.rows);*/
            res.end();
        }


    }

    return new Handler()
}

module.exports = {handler}
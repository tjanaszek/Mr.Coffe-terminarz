const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "Galimatias3!",
    database: "mrcoffee"
})

client.connect();

client.query('Select * from schedule', (err, res)=>{
    if(!err){
        console.log(res.rows);
    }
    else{
        console.log(err.message)
    }
    client.end
})
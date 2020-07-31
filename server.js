var express = require('express');
var app = express();
var cors = require('cors')
app.use(cors())

const { exec } = require("child_process");
app.get('/create-cert-template', function (req, res) {
    var cmd = `create-certificate-template -c /home/viji/code/project/cert-tools/conf.ini`
    if (req.query.issuer_name) {
        cmd += ` --issuer_name '${req.query.issuer_name}'`;
    }
    if (req.query.certificate_description) {
        cmd += ` --certificate_description '${req.query.certificate_description}'`;
    }
    if (req.query.certificate_title) {
        cmd += ` --certificate_title  '${req.query.certificate_title}'`;
    }
    var student_name = req.query.student_name;
    var template_file_name = `${req.query.reg_no}.json`;
    var final_cmd = `${cmd} --student_name '${student_name}' --template_file_name '${template_file_name}'`;
    console.log(final_cmd);
    exec(final_cmd, (error, stdout, stderr) => {
       if (error) {
           console.log(`error: ${error.message}`);
       }
       if (stderr) {
           console.log(`stderr: ${stderr}`);
       }
       console.log(`stdout: ${stdout}`);
       var resObj = {
           title    : 'success',
           message  : stdout
       }
       res.json(resObj);
   });

})


 app.get('/issue-certificate',  async function (req, res) {
    var template_file_name = `${req.query.reg_no}.json`;
    var dockerId = await getdockerid();
    exec(`sh /home/viji/code/project/issue-shell.sh ${dockerId} ${template_file_name}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }

        
        console.log(`stdout: ${stdout}`);
        var resObj = {
            title    : ' success',
            message  : stdout
        }
        res.json(resObj);

        
    });
 
 })

 function getdockerid(){
    return new Promise((resolve, reject) => {
        exec("docker ps --filter 'status=running' --format='{{.ID}}'", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject(error);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                reject(stderr);
            }
            resolve(stdout.trim());
        });
    });
 };

 app.get('/tranlist', async function (req, res) {
    var tranId = req.query.tranId;
    var dockerId = await getdockerid();
    exec(`docker exec ${dockerId} bitcoin-cli -regtest listunspent 0`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }

        
        console.log(`stdout: ${stdout}`);
        tran = JSON.parse(stdout.replace("\n","")).filter(i => i.txid === tranId)[0];
        console.log(tran);
        console.log(tranId);
        if (tran) {
            exec(`docker exec ${dockerId} bitcoin-cli -regtest gettransaction ${tran.txid}`, (error, stdout2, stderr) => {
                transaction = JSON.parse(stdout2.replace("\n",""));
                console.log(transaction);
                tran['txTime'] = transaction.time;
                exec(`docker exec ${dockerId}  bitcoin-cli -regtest decoderawtransaction ${transaction.hex}`, (error, stdout3, stderr) => {
                    decodedTransaction = JSON.parse(stdout3.replace("\n",""));
                    tran['remoteHash'] = decodedTransaction.vout.map(i => i.scriptPubKey.asm);
                    res.json(tran);
                });
            });
        } else {
            res.status(400).json({error: 'no tranId'});
        }
    });
 
 })

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})
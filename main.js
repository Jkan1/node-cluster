var cluster = require('cluster');

if (cluster.isMaster) {
    const utility = require('./utility');
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {

        const newWorker = cluster.fork();
        newWorker.on('message', function (message) {
            if (message === "RESTART") {
                return utility.restartWorkers(cluster);
            }
            console.log(`Message Recieved by Worker-${newWorker.id}:`, message);
            newWorker.send("Forwarding the message from Listner to Process")
        });

    }

    utility.printClusterSize(cluster);

    cluster.workers['3'].emit('message', "Your are the third Worker.");

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        const newWorker = cluster.fork();
    });


} else {
    var app = require('express')();

    app.all('/*', function (req, res) {
        if (req.query && req.query.restart === "true") {
            process.send('RESTART');
            return res.end('Restart Initiated');
        }
        process.send('hello from worker with id: ' + process.pid);
        res.send('process ' + process.pid + ' says hello!').end();
    })

    var server = app.listen(3000, function () {
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    });

    process.on('message', function (message) {
        console.log("Message Recieved By Worker Process:", message);
        if (message.type === 'shutdown') {
            console.log("Sutting Down", process.pid);
            process.exit(0);
        }
    });

}

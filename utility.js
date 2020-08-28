

exports.restartWorkers = function (cluster) {
    var wid, workerIds = [];

    for (wid in cluster.workers) {
        workerIds.push(wid);
    }

    workerIds.forEach(function (wid) {
        cluster.workers[wid].send({
            type: 'shutdown',
            from: 'master'
        });

        setTimeout(function () {
            if (cluster.workers[wid]) {
                cluster.workers[wid].kill('SIGKILL');
            }
        }, 5000);
    });
};

exports.printClusterSize = function (cluster) {
    console.log("Cluster -",Object.keys(cluster.workers));
}
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const DbRoute_1 = __importDefault(require("./Routes/DbRoute"));
const AuthRoute_1 = __importDefault(require("./Routes/AuthRoute"));
const Producer_1 = __importDefault(require("./Services/Implementations/MessageBroker/Producer"));
const Consumer_1 = __importDefault(require("./Services/Implementations/MessageBroker/Consumer"));
const Connection_1 = __importDefault(require("./Services/Implementations/MessageBroker/Connection"));
const numCPUs = (0, os_1.cpus)().length;
if (cluster_1.default.isPrimary) {
    // Fork workers equal to the number of CPU cores
    console.log("Number of CPU(s): ", numCPUs);
    for (let i = 0; i < numCPUs; i++) {
        const createWorker = cluster_1.default.fork();
        console.log(`Worker with pid: ${createWorker.process.pid} has been created`);
    }
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`Worker with pid: ${worker.process.pid} just died`);
        const newWorker = cluster_1.default.fork();
        console.log(`Another Worker with pid: ${newWorker.process.pid} has been created to replace the worker that just died`);
    });
}
else {
    if (cluster_1.default.worker.id === numCPUs) {
        const rabbitConnection = new Connection_1.default();
        console.log(rabbitConnection.connection);
        const producer = new Producer_1.default();
        const consumer = new Consumer_1.default();
    }
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ credentials: true }));
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use(body_parser_1.default.json());
    app.use("/DbOps", DbRoute_1.default);
    app.use("/Auth", AuthRoute_1.default);
    app.get("/", (req, res) => {
        res.write("Hello Nifemi, my name is Quickee Food");
        res.end();
    });
    app.get("/signin", (req, res) => {
        const { name } = req.query;
        res.write(`Welcome ${name}`);
        res.end();
    });
    const server = http_1.default.createServer(app);
    const ip = "127.0.0.1";
    //   const ip = "192.168.137.1";
    const port = 80;
    // const port = 5000;
    server.listen(port, 
    /* ip,*/ () => {
        cluster_1.default.worker.id === numCPUs &&
            console.log(`Server running on port ${port}`);
    });
}
//# sourceMappingURL=index.js.map
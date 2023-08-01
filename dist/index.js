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
if (cluster_1.default.isPrimary) {
    // Fork workers equal to the number of CPU cores
    const numCPUs = (0, os_1.cpus)().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    // console.log("Number of CPU(s): ", numCPUs);
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster_1.default.fork();
    });
}
else {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ credentials: true }));
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use(body_parser_1.default.json());
    app.use("/", (req, res) => {
        res.write("Hello Nifemi, my name is Quickee Food");
        res.end();
    });
    const server = http_1.default.createServer(app);
    const ip = "127.0.0.1";
    //   const ip = "192.168.137.1";
    const port = 3000;
    server.listen(port, 
    /* ip,*/ () => {
        console.log(`Server running on port ${port}`);
    });
}
//# sourceMappingURL=index.js.map
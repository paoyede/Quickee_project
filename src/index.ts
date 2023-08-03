import express, { Request, Response } from "express";
import http from "http";
import cluster from "cluster";
import { cpus } from "os";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import DbOpsRoute from "./Routes/DbRoute";
import authRoute from "./Routes/AuthRoute";

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  // Fork workers equal to the number of CPU cores
  console.log("Number of CPU(s): ", numCPUs);

  for (let i = 0; i < numCPUs; i++) {
    const createWorker = cluster.fork();
    console.log(
      `Worker with pid: ${createWorker.process.pid} has been created`
    );
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker with pid: ${worker.process.pid} just died`);
    const newWorker = cluster.fork();
    console.log(
      `Another Worker with pid: ${newWorker.process.pid} has been created to replace the worker that just died`
    );
  });
} else {
  const app = express();

  app.use(cors({ credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use("/DbOps", DbOpsRoute);
  app.use("/Auth", authRoute);

  app.get("/", (req: Request, res: Response) => {
    res.write("Hello Nifemi, my name is Quickee Food");
    res.end();
  });

  app.get("/signin", (req, res) => {
    const { name } = req.query;
    res.write(`Welcome ${name}`);
    res.end();
  });

  const server = http.createServer(app);

  const ip = "127.0.0.1";
  //   const ip = "192.168.137.1";
  const port = 80;

  server.listen(
    port,
    /* ip,*/ () => {
      cluster.worker.id === numCPUs &&
        console.log(`Server running on port ${port}`);
    }
  );
}

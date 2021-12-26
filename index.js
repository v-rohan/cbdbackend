import express from "express";
import db from "./src/models/index";
const app = express();
import storeRoute from "./src/routes/storeRoute";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create a catch-all route for testing the installation.
app.get("/", (_, res) =>
  res.status(200).send({
    message: "Hello World!",
  })
);

app.use("/stores", storeRoute);

const { Sequelize, sequelize } = db;

const port = 5000;

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    await sequelize.sync();
    app.listen(port, () => {
      console.log(`App is now running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log({ error });
  }
};

connect();

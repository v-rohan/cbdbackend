import express from 'express';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create a catch-all route for testing the installation.
app.get('*', (req, res) => res.status(200).send({
  message: 'Hello World!',
}));

const port = 5000;

app.listen(port, () => {
  console.log('App is now running at port ', port)
})

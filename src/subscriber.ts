import { amqp, queue, mailer_pass } from "./config";
import * as amqplib from "amqplib/callback_api";
import * as nodemailer from 'nodemailer';
import * as sgTransport from 'nodemailer-sendgrid-transport';
const Email = require('email-templates');

// Setup Nodemailer transport
var options = {
    auth: {
        api_key: mailer_pass
    }
}

const transport = nodemailer.createTransport(sgTransport(options));

const email = new Email({
    message: {
      from: 'support@cashbackduniya.com'
    },
    send: true,
    transport: transport
  });

// Create connection to AMQP server
amqplib.connect(amqp, (err, connection) => {
    if (err) {
        console.error(err.stack);
        return process.exit(1);
    }
    // Create channel
    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err.stack);
            return process.exit(1);
        }

        // Ensure queue for messages
        channel.assertQueue(queue, {
            // Ensures that the queue is not deleted when server restarts
            durable: true
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }
            // Only request 1 unacked message from queue
            channel.prefetch(1);
            // Set up callback to handle messages received from the queue
            channel.consume(queue, data => {
                if (data === null) {
                    return;
                }
                // Decode message contents
                let message = JSON.parse(data.content.toString('utf8'));
                // Send the message using the previously set up Nodemailer transport
                email.send(message)
                .then(() => {
                    console.log('Delivered message to %s', message.message.to);
                    channel.ack(data);
                })
                .catch((err) => {
                    console.error(err.stack);
                    return channel.nack(data);
                })
            });
        });
    });
});

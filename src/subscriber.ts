import { amqp, queue, mailgun_apikey, mailgun_url, mailgun_pass, mailgun_user } from "./config";
import * as amqplib from "amqplib/callback_api";
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

// Setup Nodemailer transport
const transport = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: mailgun_user,
        pass: mailgun_pass
    },
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
            // Ensure that the queue is not deleted when server restarts
            durable: true
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }

            // Only request 1 unacked message from queue
            // This value indicates how many messages we want to process in parallel
            channel.prefetch(1);

            // Set up callback to handle messages received from the queue
            channel.consume(queue, data => {
                if (data === null) {
                    return;
                }

                // Decode message contents
                let message = JSON.parse(data.content.toString('utf8'));

                // Send the message using the previously set up Nodemailer transport
                transport.sendMail(message, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        // put the failed message item back to queue
                        return channel.nack(data);
                    }
                    console.log('Delivered message %s', info.messageId);
                    // remove message item from the queue
                    channel.ack(data);
                });
            });
        });
    });
});

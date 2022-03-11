import { amqp, queue } from "../config";
import * as amqplib from 'amqplib';

const publishMail = async (mail: Object) => {
    amqplib.connect(amqp, (err: Error, connection: any) => {
        if (err) {
            console.error(err.stack);
        }
        // Create channel
        connection.createChannel((err: Error, channel: any) => {
            if (err) {
                console.error(err.stack);
            }
            // Ensure queue for messages
            channel.assertQueue(queue, {
                // Ensure that the queue is not deleted when server restarts
                durable: true
            }, (err: Error) => {
                if (err) {
                    console.error(err.stack);
                }
                // Create a function to send objects to the queue
                // Javascript object is converted to JSON and then into a Buffer
                let sender = (content: Object, next: Function) => {
                    let sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)));
                    if (sent) {
                        return next();
                    } else {
                        channel.once('drain', () => next());
                    }
                };
                // push messages to queue
                sender(mail, () => console.log("Email Sending Queued"));
            });
        });
    });
}

export { publishMail }
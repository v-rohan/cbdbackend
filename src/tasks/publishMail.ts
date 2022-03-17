import { amqp, queue } from "../config";
import * as amqplib from 'amqplib/callback_api';

const publishMail = (mail: Object) => {
    amqplib.connect(amqp, (err: Error, connection: any) => {
        if (err) {
            console.error(err);
            return;
        }
        // Create channel
        connection.createChannel((err: Error, channel: any) => {
            if (err) {
                console.error(err);
                return;
            }
            // Ensure queue for messages
            channel.assertQueue(queue, {
                // Ensure that the queue is not deleted when server restarts
                durable: true
            }, (err: Error) => {
                if (err) {
                    console.error(err);
                    return;
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
                sender(mail, () => {console.log("Mail Queued"); return;});
                return;
            });
        });
    });
}

export { publishMail }
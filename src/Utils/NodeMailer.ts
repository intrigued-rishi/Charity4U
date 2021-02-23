import * as nodeMailer from 'nodemailer';
import * as SendGrid from 'nodemailer-sendgrid-transport';

export class NodeMailer {
    private static initializeTransport() {
        return nodeMailer.createTransport(SendGrid({
            service: 'SendGrid',
            auth: {
                api_key: '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'
            }
        }));
    }

    static sendEmail(data: { to: string[] , subject: string, html: string}): Promise<any> {
        return NodeMailer.initializeTransport().sendMail({
            from: 'jaydipdey2807@gmail.com',
            to: data.to,
            subject: data.subject,
            html: data.html
        });
    }
}

export default interface Mail {
    from: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    text: string;
    message: string;
}
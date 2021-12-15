export default interface Mail {
    from: string;
    destination: string;
    cc: string;
    bcc: string;
    subject: string;
    content: string;
};
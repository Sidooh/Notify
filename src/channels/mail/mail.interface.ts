export default interface IMail {
    from: string;
    destination: string;
    cc: string;
    bcc: string;
    subject: string;
    content: string;
};
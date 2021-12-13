export default interface Mailer {
    to(users: object): this

    bcc(address: object): this

    raw(text: string): this
}
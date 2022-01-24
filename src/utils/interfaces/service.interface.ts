import { INotification } from '@/models/interfaces';

export default interface ServiceInterface {
    send(retry?:INotification): Promise<any>;
}
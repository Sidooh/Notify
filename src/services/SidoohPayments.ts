import { log } from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';

export default class SidoohPayments extends SidoohService {
    static async getFloatAccount(id: number) {
        log.info('...[SRV - PAYMENTS]: Get Float Account...');

        const url = `${CONFIG.sidooh.services.payments.url}/float-accounts/${id}`;

        return await this.fetch(url).then(({ data }) => {
            log.info('...[SRV - PAYMENTS]: RES - ', { data });
            return data;
        }, error => {
            console.log(error);
            const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data;
            log.error('...[SRV - PAYMENTS]: ERR - ', { message });
        });
    }
}

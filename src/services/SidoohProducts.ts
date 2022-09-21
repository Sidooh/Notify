import { log } from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';

export default class SidoohProducts extends SidoohService {
    static async getTandaBalance() {
        log.info('...[SRV - PRODUCTS]: Tanda Balance...');

        const url = `${CONFIG.sidooh.services.products.url}/service-providers/balance`;

        return await this.fetch(url).then(({ data }) => {
            log.info('...[SRV - PRODUCTS]: RES - ', { data });
            return data;
        }, error => {
            const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data;
            log.error('...[SRV - PRODUCTS]: ERR - ', { message });
        });
    }
}

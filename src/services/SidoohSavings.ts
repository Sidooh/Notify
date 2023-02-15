import { log } from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';

export default class SidoohSavings extends SidoohService {
    static async getCumulativeSavings() {
        log.info('...[SRV - SAVINGS]: Get Cumulative Savings...');

        const url = `${CONFIG.sidooh.services.savings.url}/cumulative-savings`;

        return await this.fetch(url).then(({ data }) => {
            log.info('...[SRV - SAVINGS]: RES - ', { data });
            return data;
        }, error => {
            const errors = error.isAxiosError ? error?.response?.data?.errors || error.message : error?.response?.message || error?.response?.data;
            log.error('...[SRV - SAVINGS]: ERR - ', { errors });
        });
    }
}

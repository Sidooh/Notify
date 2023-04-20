import axios, { AxiosInstance, Method } from 'axios';
import { log } from '../utils/logger';
import { CONFIG } from '../config';
import MemoryCache from '../utils/cache/MemoryCache';

export default class SidoohService {
    static http = async (): Promise<AxiosInstance> => {
        let token = await MemoryCache.remember('auth_token', 1, async () => await this.authenticate());

        return axios.create({
            headers     : {
                Authorization: `Bearer ${token}`,
                Accept       : 'application/json',
                ContentType  : 'application/json'
            },
            responseType: 'json'
        });
    };

    static authenticate = async (): Promise<string> => {
        log.info('...[SRV - SIDOOH]: Authenticate...');

        const url = `${CONFIG.sidooh.services.accounts.url}/users/signin`;

        const { data: { access_token } } = await axios.post(url, { email: 'aa@a.a', password: '12345678' });

        return access_token;
    };

    static fetch = async (url: string, method: Method = 'GET', data: {} = {}) => {
        log.info('...[SRV - SIDOOH]: Fetch...', { url, method, data });

        const http = await this.http();

        try {
            return http[method.toLowerCase()](url, data).then(({ data }) => data);
        } catch (e) {
            throw new Error('Something went wrong, please try again.');
        }
    };
}

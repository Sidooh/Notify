import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Service } from '../service';
import axios from 'axios';
import { Status } from '../../../utils/enums';

let service: Service;
describe('mail.service', () => {
    beforeEach(() => {
        service = new Service;
    });

    describe('send', () => {
        it('should reject null message', async function() {
            vi.spyOn(axios, 'post');

            expect(() => service.message('').send()).rejects.toThrow('Message is required.');
            expect(() => service.send()).rejects.toThrow('Message is required.');
        });

        it('should send slack notification if data is valid.', async function() {
            vi.spyOn(axios, 'post').mockResolvedValue({ data: {} });

            const res = await service.message('Hello World').send();

            expect(res).toEqual({ status: Status.COMPLETED });
        });
    });
});
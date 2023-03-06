import axios from 'axios';
import { vi } from 'vitest';

/**
 * _________________________________________________________________    MOCKS
 * */
vi.mock('axios');
vi.mock('winston', () => ({
    config      : {
        syslog: []
    },
    format      : {
        json  : vi.fn(),
        colorize  : vi.fn(),
        combine  : vi.fn(),
        timestamp: vi.fn(),
        printf   : vi.fn(),
        align    : vi.fn()
    },
    createLogger: vi.fn().mockReturnValue({
        info : vi.fn(),
        debug: vi.fn(),
        error: vi.fn()
    }),
    transports  : {
        File   : vi.fn(),
        Console: vi.fn()
    }
}));

/*vi.spyOn(new Sms(new WebSms({
    accessKey: '',
    apiKey   : '',
    clientId : '',
    senderId : ''
})), 'send').mockImplementation(async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockResolvedValueOnce([]);

    const { data } = await mockedAxios.post('/SendBulkSMS', {});

    return data;
});*/

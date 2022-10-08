import { ProcessServiceProviderBalances } from './ProcessServiceProviderBalances';

const Jobs = async () => {
    await ProcessServiceProviderBalances()
}

export default Jobs
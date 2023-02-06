import { schedule } from 'node-cron';
import { log } from '../utils/logger';
import { CONFIG } from '../config';
import WebSMSService from '../channels/sms/WebSMS/WebSMS.service';
import ATService, { ATApp } from '../channels/sms/AT/AT.service';
import { Help } from '../utils/helpers';
import SidoohProducts from '../services/SidoohProducts';
import NotificationRepository from '../repositories/notification.repository';
import { Channel, EventType } from '../utils/enums';
import { env } from '../utils/validate.env';
import SidoohPayments from '../services/SidoohPayments';
import SidoohSavings from '../services/SidoohSavings';

export const ProcessSystemBalances = () => {
    if (!env.SP_BALANCE_NOTIFICATION_ENABLED) return;

    log.info('...[JOB]... Setting up system balances job...');

    schedule(CONFIG.sidooh.cron.sp_balance_notification_cron, async () => {
        const savingsFloatAccount = await SidoohPayments.getFloatAccount(2);
        const cumulativeSavings = await SidoohSavings.getCumulativeSavings();

        const smsSettings = await Help.getSMSSettings();

        const websms = Number((await new WebSMSService(smsSettings.websms_env).balance()).slice(3));
        const productBalances = await SidoohProducts.getTandaBalance(),
            tanda = {
                float   : productBalances.tanda[0].balances[0].available,
                earnings: productBalances.tanda[0].balances[1].available
            };
        const AT = {
            // sms    : await new ATService(smsSettings.africastalking_env).balance(),
            // airtime: Number(productBalances.at.data.UserData.balance.slice(3)),
            ussd: await new ATService(smsSettings.africastalking_env, ATApp.USSD).balance()
        };

        let message = `! System Balances Below Threshold:\n`;

        if (tanda.float <= env.TANDA_FLOAT_THRESHOLD) message += `\t - Tanda Float: ${tanda.float}\n`;
        if (AT.ussd <= env.AT_USSD_THRESHOLD) message += `\t - AT USSD: ${AT.ussd}\n`;
        // if (AT.sms <= env.AT_SMS_THRESHOLD) message += `\t - AT SMS: ${AT.sms}\n`;
        // if (AT.airtime <= env.AT_AIRTIME_THRESHOLD) message += `\t - AT Airtime: ${AT.airtime}\n`;
        if (websms <= env.WEBSMS_THRESHOLD) message += `\t - WebSMS: ${websms}\n`;
        if (savingsFloatAccount.balance <= (env.SAVINGS_FLOAT_THRESHOLD_PERCENTAGE / 100) * cumulativeSavings) {
            message += `\t - Savings Float: ${savingsFloatAccount.balance}\n`;
        }

        if (message.includes('-')) {
            await NotificationRepository.store(
                Channel.SMS, message, EventType.STATUS_UPDATE, env.ADMIN_CONTACTS.split(',')
            );
        }
    });
};
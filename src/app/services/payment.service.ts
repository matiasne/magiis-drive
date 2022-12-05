import { Injectable } from '@angular/core';
import { ConnectionServices } from './connection/connection.service';
import { GetPaymentMethodCommand, IGetPaymentMethodCommandParameters } from './connection/command/getPaymentMethod.command';

@Injectable({providedIn:'root'})
export class PaymentService {

    constructor(private connectionService: ConnectionServices) { }

    public getPaymentMethods(carrierEmail: string, clientId: string) {
        const getPaymentMethodCommand = new GetPaymentMethodCommand()
        getPaymentMethodCommand.setParameters(<IGetPaymentMethodCommandParameters>{
            carrierEmail: carrierEmail,
            clientId: clientId
        })

        return this.connectionService.Request(getPaymentMethodCommand).then(response => {
            return response;
        })
            .catch(error => {
                throw error;
            })
    }
}

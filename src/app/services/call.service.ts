import { Injectable } from "@angular/core";
import { IdentityService } from "./identity.service";
import { TravelService } from "./travel.service";
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx'


@Injectable({providedIn:'root'})
export class CallService {

    constructor(
        private identityService: IdentityService,
        private travelService: TravelService,
        private callNumber: CallNumber
    ) { }

    public call(callTo: string) {
        console.log(callTo)
        switch (callTo) {
            case "CALL_CARRIER": 
            console.log('dale llama aa')
                const carrierPhoneNumber = this.identityService.getCarrierPhoneNumber();
                console.log(carrierPhoneNumber)
                    return this.callNumber.callNumber('+'+carrierPhoneNumber, true)
                        .then(res => console.log(res))
                        .catch ( err => console.log(err))
            break;
            case "CALL_911": 
                let telephonePanic: string = this.identityService.getTelephonePanic();
                if(telephonePanic != null && telephonePanic != "") {
                    console.log("CALL_911", telephonePanic);
                        this.callNumber.callNumber(telephonePanic, true)
                        .then(res => console.log(res));
                }
            break;
            case "CALL_PASSENGER": 
                let passengerPhoneNumber: string = this.travelService.currentTravel.passengerPhoneNumber;
                console.log("CALL_PASSENGER", passengerPhoneNumber);
                    this.callNumber.callNumber('+'+passengerPhoneNumber, true)
                        .then(res => console.log(res));

            break;
            default: break;
        }
    }

    // sendSms(phoneNumber: string, msg: string) {
    //     //console.log("sending");
    //     //window.open("sms:" + phoneNumber + "?body=" + msg, '_system');
    //     this.iab.create("sms:" + phoneNumber + "?body=" + msg, '_blank');
    // }

}

import { TravelStatusEnum } from './../services/enum/travelStatus';

export class CurrentTripStatusModel {
        id: number;
        /**GOING_TO_CLIENT, GOING_TO_DESTINATION or CLOSING_TRAVEL */
        status: TravelStatusEnum;
}

import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class StartStreetTravelCommand extends IRequestCommand<ICommandResponse, ErrorDetails, IStartStreetTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierId}/travels/startStreetTravel';

    setCommandUrl(carrierId: string) {
        this._commandUrl = this._commandUrl.replace('{carrierId}', carrierId);
    };

    setCommandBody(body: IStartStreetTravelCommandParameters) {
        this._commandBody = body;
    }
}

export interface IStartStreetTravelCommandParameters extends ICommandParameters {
    driverId: number,
    lat: string,
    lng: string,
    vehicleId: number,
    originToken: string,
    originPlatform: string
}
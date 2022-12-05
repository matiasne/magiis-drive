import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';
import { Base } from '../../../models/base.model';

export class GetCarrierBasesCommand extends IRequestCommand<IGetCarrierBasesResponse, ErrorDetails, IGetCarrierBasesCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierAccountId}/branches';
    public setParameters(parameters: IGetCarrierBasesCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{carrierAccountId}', parameters.carrierId.toString());
    };
}

export interface IGetCarrierBasesCommandParameters extends ICommandParameters {
    carrierId: string;
}

export interface IGetCarrierBasesResponse extends ICommandResponse {
  bases: Base[];
}

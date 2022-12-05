import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, PagesResponseDTO } from '../interfaces/apiInterfaces';
export class GetMultiregionCommand extends IRequestCommand<IGetMultiregionResponse, ErrorDetails, IGetMultiregionCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'multiregion/country/{countryName}';
    public setParameters(parameters: IGetMultiregionCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{countryName}', parameters.countryName.toString());
    };
}

export interface IGetMultiregionCommandParameters extends ICommandParameters {
    countryName: string;

}

export interface IGetMultiregionResponse extends ICommandResponse {
    name: string;
    pages: PagesResponseDTO[];
}

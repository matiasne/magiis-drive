import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class StatsCommand extends IRequestCommand<IStatsResponse, ErrorDetails, IStatsCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierUserId}/drivers/{driverUserId}/stats?dateFrom={dateFrom}&dateTo={dateTo}';
    public setParameters(parameters: IStatsCommandParameters) {
        this._commandUrl = this._commandUrl
        .replace('{carrierUserId}', parameters.carrierUserId.toString())
        .replace('{driverUserId}', parameters.driverUserId.toString())
        .replace('{dateFrom}', parameters.dateFrom.toJSON().toString().replace("\{", "").replace("\}", ""))
        .replace('{dateTo}', parameters.dateTo.toJSON().toString().replace("\{", "").replace("\}", ""))
        this._commandBody = parameters;
    };
}

export interface IStatsCommandParameters extends ICommandParameters {
    carrierUserId: number;
    driverUserId: number;
    dateFrom: Date;
    dateTo: Date
}

export interface IStatsResponse extends ICommandResponse {
    
}
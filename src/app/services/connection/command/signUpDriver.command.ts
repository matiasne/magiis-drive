import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { RegistrationRequestDTO, RegistrationResponseDTO, ErrorDetails} from '../interfaces/apiInterfaces';

export class SignUpDriverCommand extends IRequestCommand<ISignUpCarrierResponse, ErrorDetails, ISignUpDriverCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'drivers/solicitude';
    _replaceDefaultHeader = true;
    _canAddCustomHeaders = false;
    _needAuthenticate = false;
}

export interface ISignUpDriverCommandParameters
  extends RegistrationRequestDTO,
    ICommandParameters {
  country?: string;
  tributeName?: string;
  companyName?: string;
  userName?: string;
  password?: string;
  bankName?: string;
  bankUniqueNumber?: string;
  email?: string;
  comercialLicense?: string;
  tributeCondition?: string;
  imageLogo?: string;
  state: string;
  countryChecked: false;
  tributeNumberChecked: false;
  companyNameChecked: false;
  userNameChecked: false;
  bankNameChecked: false;
  bankUniqueChecked: false;
  emailChecked: false;
  comercialLicenseChecked: false;
  tributeConditionChecked: false;
  imageLogoChecked: false;
  observations:String
}

export interface ISignUpCarrierResponse extends RegistrationResponseDTO, ICommandResponse {
    country?: string;
    tributeName?: string;
    companyName?: string;
    userName?: string;
    password?: string;
    bankName?: string;
    bankUniqueNumber?: string;
    email?: string;
    comercialLicense?: string;
    tributeCondition?: string;
    imageLogo?: string;
    state: string;
}

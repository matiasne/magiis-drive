import { TravelChatMessage } from './travel-chat-message';

export class TravelChat {
  pax: string;
  driver: string;
  carrier: string;
  token_pax: string;
  token_driver: string;
  last_message: string;
  messages: TravelChatMessage[];

  constructor(pax?: string, driver?: string, carrier?: string, token_pax?: string, token_driver?: string, last_message?: string, messages?: TravelChatMessage[]) {
    this.pax = pax ? pax : null;
    this.driver = driver ? driver : null;
    this.carrier = carrier ? carrier : null;
    this.token_pax = token_pax ? token_pax : null;
    this.token_driver = token_driver ? token_driver : null;
    this.last_message = last_message ? last_message : null;
    this.messages = messages ? messages : null;
  }
}

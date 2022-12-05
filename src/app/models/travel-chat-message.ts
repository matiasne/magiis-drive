export class TravelChatMessage {
  from: string;
  body: string;
  author: string;
  schedule: any;

  constructor(from: string, body: string, author?: string, schedule?: any) {
    this.from = from;
    this.body = body;
    this.author = author;
    this.schedule = schedule;
  }
}

export class WaitDetailItemModel {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    minutes: number = 0;
    seconds: number = 0;


    constructor(startDate: Date, endDate: Date) {
        this.startDate = startDate;
        this.endDate = endDate;
        let totalSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
        this.minutes = Math.floor(totalSeconds / 60);
        this.seconds = Math.floor(totalSeconds % 60);
        this.startTime = this.startDate.getHours() + ":" + this.startDate.getMinutes() + ":" + this.startDate.getSeconds();
        this.endTime = this.endDate.getHours() + ":" + this.endDate.getMinutes() + ":" + this.endDate.getSeconds();
    }
}
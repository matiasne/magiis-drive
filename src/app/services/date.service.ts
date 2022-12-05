export class DateService {
    
    //Returns the day of the week string
    static getDayOfWeek(date: Date): string {
        return ('0' + (date.getDate().toString())).substr(-2);
    }
    
    //Returns the month short string
    static getMonth(date: Date): string {
        return monthNames[date.getMonth()];
    }
    
    //Returns the hours string
    static getHours(date: Date): string {
        return date.getHours().toString();
    }
    
    //Returns the minutes string
    static getMinutes(date: Date): string {
        return DateService.checkDigits(date.getMinutes().toString());
    }

    static formatDate(date: string): Date {
        return new Date(date);
    }

    static checkDigits(value: string): string {
        if (value.length == 1 || +value < 10) {
          return `0${value}`;
        }
        return value;
    }
}
const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
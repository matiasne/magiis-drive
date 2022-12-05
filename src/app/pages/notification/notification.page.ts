//import { Component } from "@angular/core"

import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-notification-page',
    templateUrl: 'notification.page.html',
    styleUrls: ['notification.page.scss']
})
export class NotificationPage implements OnInit {

    notificationsShow: Array<NotificationShow> = new Array<NotificationShow>();

    constructor() {
    }
    ngOnInit(): void {
    }

    ionViewDidEnter() {
        // this.notificationService.getNotifications().then(notifications => {

        const notification = <NotificationShow>{
            icon: 'ios-cash-outline',
            label: 'Juan Perez, ha realizado el pago'
        };

        const notification1 = <NotificationShow>{
            icon: 'ios-cash-outline',
            label: 'Rodrigo Lijke, ha realizado el pago'
        };
        this.notificationsShow.push(notification);
        this.notificationsShow.push(notification1);

        // })
    }

}

interface NotificationShow {
    label: string;
    icon: string;
}

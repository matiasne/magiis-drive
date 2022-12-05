import { ChangeDetectorRef, Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TravelChatMessage } from '../../models/travel-chat-message';
import { Subject, takeUntil } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { IdentityService } from '../../services/identity.service';
import { StorageService } from '../../services/storage/storage.service';
import { StorageKeyEnum } from '../../services/storage/storageKeyEnum.enum';

import { Platform, NavController } from '@ionic/angular';


@Component({
	selector: 'app-page-travel-chat',
	templateUrl: 'travel-chat.html',
  styleUrls:['travel-chat.scss']

})

export class TravelChatPage {
  destroy$: Subject<boolean> = new Subject<boolean>();

  travelId: number;
  messages: TravelChatMessage[];
  travelIdForCarrier: number;
  travelDriverName: string;
  travelPassengerName: string;

  message: string;

	constructor(
    private chatService: ChatService,
    private travelService: TravelService,
    private identityService: IdentityService,
    private platform: Platform,
    private navCtrl: NavController,
    private changeDetector: ChangeDetectorRef,
    private storageService: StorageService
  ) {
    this.travelId = this.travelService.currentTravel.travelId;
    this.travelIdForCarrier = (this.travelService.currentTravel as any).travelIdForCarrier;
    this.travelDriverName = this.identityService.fullName;
    this.travelPassengerName = this.travelService.currentTravel.passengerName;
  }

	ionViewDidEnter() {
    this.getMessages(this.travelId);
    this.chatService.setUnreadMessages(false);

    this.platform.backButton.subscribe(() => {
      this.navCtrl.pop();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

	getMessages(travelId: number) {
    return this.chatService.getMessages(travelId)
      .valueChanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(dbMessages => {
        this.storageService.setData(StorageKeyEnum.readMessages, dbMessages.length);
        this.messages = dbMessages as TravelChatMessage[];
      });
  }

  sendMessage() {
    if (this.message != null && this.message != '') {
      let chatMessage = new TravelChatMessage('D', this.message);
      this.chatService.addMessage(this.travelId, chatMessage, this.travelDriverName);
    } else {
      console.log("Mensaje vacio");
    }
    this.message = '';
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }
}

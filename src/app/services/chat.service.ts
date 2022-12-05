
import { TravelChat } from '../models/travel-chat';
import { TravelChatMessage } from '../models/travel-chat-message';
import { CurrentTravelModel } from '../models/current-travel.model';
import { FirebaseService } from './firebase.service';
import { take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from './storage/storage.service';
import { StorageKeyEnum } from './storage/storageKeyEnum.enum';
import {
  AngularFireDatabase,
} from '@angular/fire/compat/database';
import { Injectable } from '@angular/core';
import { updateDoc, serverTimestamp } from "firebase/firestore";


@Injectable({providedIn:'root'})
export class ChatService {
  public unreadMessages: Subject<boolean>;

  constructor(
    private afDB: AngularFireDatabase,
    private firebaseService: FirebaseService,
    private storageService: StorageService
  ) {
    this.unreadMessages = new Subject<boolean>();
  }

  public setUnreadMessages(value: boolean) {
    this.storageService.setData(StorageKeyEnum.unreadMessages, value);
    this.unreadMessages.next(value);
  }

  public getChat(travelId: number) {
    return this.afDB.object('/chats/'+travelId);
  }

  public createChat(currentTravel: CurrentTravelModel, driverName: string) {
    let chat: TravelChat = new TravelChat(
      currentTravel.passengerName,
      driverName,
      currentTravel.company,
      null, // Token pax
      this.firebaseService._firebaseToken, // Token driver
    );

    this.getChat(currentTravel.travelId).valueChanges().pipe(take(1)).subscribe(dbChat => {
      console.log(dbChat);

      if(dbChat) {
        if((dbChat as TravelChat).messages) {
          chat.messages = (dbChat as TravelChat).messages;
        }
        if((dbChat as TravelChat).token_pax) {
          chat.token_pax = (dbChat as TravelChat).token_pax;
        }
      }

      return this.afDB.object("/chats/"+currentTravel.travelId).set(chat);
    });
  }

  public getMessages(travelId: number) {
    return this.afDB.list('/chats/'+travelId+'/messages');
  }

  public addMessage(chatId: number, message: TravelChatMessage, author: string) {
    message.author = author;
    message.schedule = serverTimestamp();
    return this.afDB.database.ref('/chats/'+chatId+'/messages').push(message);
  }


}

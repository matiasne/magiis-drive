import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelChat } from 'src/app/models/travel-chat';
import { TravelChatPage } from './travel-chat';
import { TravelChatModule } from './travel-chat.module';

const routes: Routes = [
  {
    path: '',
    component: TravelChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelChatRoutingModule {}

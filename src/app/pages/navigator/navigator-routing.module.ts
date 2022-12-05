import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigatorPage } from './navigator.page';

const routes: Routes = [
  {
    path: '',
		component: NavigatorPage,
		children: [		
      {
        path: 'home',
        loadChildren: () => import('../../pages/home/home.module').then( m => m.HomePageModule)
      },{
        path: 'Signer',
        loadChildren: () => import('../../pages/signer/signer.module').then( m => m.SignerPageModule)
      },
      {
        path: 'TravelCancel',
        loadChildren: () => import('../../pages/travel-cancel/travel-cancel.module').then( m => m.TravelCancelModule)
      },
       {
         path: 'TravelChat',
         loadChildren: () => import('../../pages/travel-chat/travel-chat.module').then( m => m.TravelChatModule)
       },
       {
        path: 'TravelEdit',
        loadChildren: () => import('../../pages/travel-edit/travel-edit.module').then( m => m.TravelEditPageModule)
      },
       {
         path: 'TravelEditSearch',
         loadChildren: () => import('../../pages/travel-edit-search/travel-edit-search.module').then( m => m.TravelEditSearchModule)
       },
       {
        path: 'TravelDetailPage',
        loadChildren: () => import('../../pages/travel-detail/travel-detail.module').then( m => m.TravelDetailPageModule)
      },
       {
        path: 'TravelNewDestination',
        loadChildren: () => import('../../pages/travel-new-destination/travel-new-destination.module').then( m => m.TravelNewDestinationModule)
      },
      // {
  //   path: 'TavelInProgress',
  //   loadChildren: () => import('../../pages/travel-in-progress/travel-in-progress.module').then( m => m.TravelInProgressModule)
  // },
  {
    path: 'TravelNextDestination',
    loadChildren: () => import('../../pages/travel-next-destination/travel-next-destination.module').then( m => m.TravelNextDestinationModule)
  },
  // {
  //   path: 'TravelResume',
  //   loadChildren: () => import('../../pages/travel-resume/travel-resume.module').then( m => m.TravelResumeModule)
  // },
  // {
  //   path: 'TravelToStart',
  //   loadChildren: () => import('../../pages/travel-to-start/travel-to-start.module').then( m => m.TravelToStartModule)
  // },
  // {
  //   path: 'TravelTransferCost',
  //   loadChildren: () => import('../../pages/travel-transfer-cost/travel-transfer-cost.module').then( m => m.TravelTransferCostModule)
  // },
			{
			path: '',
			redirectTo: '/navigator/home',
			pathMatch: 'full'
			}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NavigatorPageRoutingModule {}

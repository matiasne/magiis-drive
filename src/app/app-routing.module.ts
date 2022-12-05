import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login', // DONE
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'Notification',
    loadChildren: () =>
      import('./pages/notification/notification.module').then(
        (m) => m.NotificationPageModule
      ),
  },

 {
   path: 'OutdatedVersionPage',
   loadChildren: () =>
     import('./pages/outdated-version/outdated-version.module').then(
       (m) => m.OutdatedVersionPageModule
     ),
  },
  {
    path: 'RequiredPermissionPage',
  loadChildren: () => import('./pages/required-permission/required-permission.module').then( m => m.RequiredPermissionModule)
  },
   {
    path: 'RestorePassPage', // DONE
   loadChildren: () => import('./pages/restore-pass/restore-pass.module').then( m => m.RestorePassPageModule)
 },
   {
    path: 'Settings',
     loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
   },
   
  {
    path: 'Stats',
    loadChildren: () => import('./pages/stats/stats.module').then( m => m.StatsPageModule)
  },
  {
    path: 'TravelAddOther',
    loadChildren: () => import('./pages/travel-add-other/travel-add-other.module').then( m => m.TravelAddOtherModule)
  },
  {
    path: 'TravelAddParking',
    loadChildren: () => import('./pages/travel-add-parking/travel-add-parking.module').then( m => m.TravelAddParkingModule)
  },
  // es un modal {
  //   path: 'TravelAddToll',
  //   loadChildren: () => import('./pages/travel-add-toll/travel-add-toll.module').then( m => m.TravelAddTollModule)
  // },
  
   {
     path: 'TravelConfirm',
     loadChildren: () => import('./pages/travel-confirm/travel-confirm.module').then( m => m.TravelConfirmModule)
   },
  {
    path: 'TravelDetailPage',
    loadChildren: () => import('./pages/travel-detail/travel-detail.module').then( m => m.TravelDetailPageModule)
  },
  {
    path: 'TravelResumePage',
    loadChildren: () => import('./pages/travel-resume/travel-resume.module').then( m => m.TravelResumeModule)
  },
  {
    path: 'TravelEdit',
    loadChildren: () => import('./pages/travel-edit/travel-edit.module').then( m => m.TravelEditPageModule)
  },
  {
    path: 'TravelEditSearch',
    loadChildren: () => import('./pages/travel-edit-search/travel-edit-search.module').then( m => m.TravelEditSearchModule)
  },
 
  // {
  //   path: 'TavelInProgress',
  //   loadChildren: () => import('./pages/travel-in-progress/travel-in-progress.module').then( m => m.TravelInProgressModule)
  // },
  {
    path: 'TravelListPage',
    loadChildren: () => import('./pages/travel-list/travel-list.module').then( m => m.TravelListModule)
  },
  {
    path: 'TravelToStartPage',
    loadChildren: () => import('./pages/travel-to-start/travel-to-start.module').then( m => m.TravelToStartModule)
  },
 
  

   
  {
    path: 'navigator',
    loadChildren: () => import('./pages/navigator/navigator.module').then( m => m.NavigatorPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

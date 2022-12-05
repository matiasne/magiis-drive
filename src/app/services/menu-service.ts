
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class MenuService {

	private menuDataBtns: Array<MenuPages> = [
		{ "title": "menu.home", "theme": "HomePage", "icon": "md-home", "listView": true, "component": "", "singlePage": false, "css": "itemMyProfile", "iconMenu": "" },
		{ "title": "menu.trips", "theme": "TravelListPage", "icon": "md-car", "listView": true, "component": "", "singlePage": false, "css": "itemMyProfile", "iconMenu": "" },
		{ "title": "menu.settings", "theme": "Settings", "icon": "md-options", "listView": true, "component": "", "singlePage": false, "css": "itemMyProfile", "iconMenu": "" },
		{ "title": "menu.statistics", "theme": "StatsPage", "icon": "ios-stats", "listView": true, "component": "", "singlePage": false, "css": "itemMyProfile", "iconMenu": "" },
	];
	private menuDataInfo: MenuInfo = {
		"background": "assets/images/background/16.jpg",
		"title": "Ionic3 UI Theme - Blue Light",
		"welcome": "Bienvenido!",
		"alertIcon": "assets/images/icono alerta verde.png",
		"btnPtt": "BOTÓN PTT",
		"btnPanic": "BOTÓN PÁNICO",
	};

	constructor() { }

	public getAllThemes(): Observable<Array<MenuPages>> {
		return new Observable(observer => {
			observer.next(this.menuDataBtns);
			observer.complete();
		});
	};

	public getDataForTheme(): Observable<MenuInfo> {
		return new Observable(observer => {
			observer.next(this.menuDataInfo);
			observer.complete();
		});
	};
}
export interface MenuPages {
	title: string,
	theme: string,
	icon: string,
	listView: boolean,
	component: string,
	singlePage: boolean,
	css: string,
	iconMenu: string
}
export interface MenuInfo {
	background: string,
	title: string,
	welcome: string,
	alertIcon: string,
	btnPtt: string,
	btnPanic: string
}



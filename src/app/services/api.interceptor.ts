import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable, Subject, BehaviorSubject, timer } from 'rxjs';
import { finalize, retryWhen, mergeMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs'

/**
 * Intercepta solicitudes HTTP y en caso de recibir un error por offline, timeout o failed
 * realiza un reintento de dicha solicitud.
 */
@Injectable({providedIn:'root'})
export class ApiInterceptor implements HttpInterceptor {
  static onChangeState = new Subject<boolean>();
  static onChangeState$ = ApiInterceptor.onChangeState.asObservable();
  static repeticionEnCurso = new BehaviorSubject<boolean>(false);
  public reintentoConexionEnCurso$ = ApiInterceptor.repeticionEnCurso.asObservable();

  constructor() {}

  /**
   * Interceptor de la petición HTTP.
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.evaluarTransaccional(req, true);
    return next.handle(req).pipe(
      retryWhen((error) => this.politicaDeReintento(error, req.url)),
      catchError((error) => this.manejarError(error)),
      finalize(() => { this.evaluarTransaccional(req, false); })
    );
  }

  /**
   * Manejador de loader para la muestra de spinner en
   * tiempos de carga.
   * @param req
   * @param start
   */
  private evaluarTransaccional(req: HttpRequest<any>, start: boolean): void {
    if (req && req.body && req.body.hasOwnProperty('spinnerOverlay')) {
      if (req.body.spinnerOverlay) {
        start ? this.agregarSpinner() : this.quitarSpinner();
      }
    } else {
      // Detect default spinnerOverlay
      if (!(req.url.includes("magiis")) &&
      (req.method === "GET" || req.method === "POST" || req.method === "PUT" || req.method === "DELETE")) {
        start ? this.agregarSpinner() : this.quitarSpinner();
      }
    }
    ApiInterceptor.repeticionEnCurso.next(false);
  }

  /**
   * Agrega spinner de carga mientras realiza los reintentos.
   */
  private agregarSpinner() {
    ApiInterceptor.onChangeState.next(true);
  }

  /**
   * Quita el spinner de carga.
   */
  private quitarSpinner() {
    ApiInterceptor.onChangeState.next(false);
  }

  /**
   * Logica de reintento en base al status recibido en el error.
   * Si el status es 0 (timeout, failed, offline), se reintenta.
   * @param errores
   */
  private politicaDeReintento(errores: Observable<any>, url?: string): Observable<any> {
    return errores.pipe(
      mergeMap((val: any) => {
        if (val.status !== 0) {
          return throwError(val);
        } else {
          if(url.includes("finalize")) {
            return throwError(val);
          } else {
            // TODO: Se requiere que el reintento solo ocurra cuando la conexión
            // haya sido restablecida.
            console.info('Se reintenta la solicitud');
            ApiInterceptor.repeticionEnCurso.next(true);
            return timer(5000)
          }
        }
      })
    );
  }

  /**
   * Manejo de errores dependiendo de su estado.
   * @param err
   */
  private manejarError(err: any) {

    err.esDeApi = true;
    // Errores ignorados no se imprimen en consola, no se loguean en servidor remoto y no generan modal.
    err.fueNotificado = true;

    switch (err.status) {
      // TODO: Agregar tantos case por cuantos codStatus de error se quieran controlar.
      case 0:
       /* Errores que se dan porque el servidor no está accesible
          (timeout, failed, offline) son llenados como status 0.
          Hay que cambiar politicaDeReintento para que errores por desconexión lleguen a esta instancia.
          Inyectar Network y usar this.network.onDisconnect(). */
        break;
      case 404:
      default:
        err.fueNotificado = false;
        break;
    }

    return throwError(err);
  }
}

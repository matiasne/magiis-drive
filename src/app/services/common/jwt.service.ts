import { Injectable } from '@angular/core';
import * as JWT from 'jwt-decode';



@Injectable({providedIn:'root'})
export class JwtService {
    // Return a object from token
    public decode<TDecode>(token: string): TDecode {
        const t = JWT<TDecode>(token);
        return t;

    }
}


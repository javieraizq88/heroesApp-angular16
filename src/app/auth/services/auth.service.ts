import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, tap, of, map, catchError } from 'rxjs';

import { environments } from '../../../environments/environments';
import { User } from '../interfaces/user.interface';

@Injectable({providedIn: 'root'})
export class AuthService {

  private baseUrl = environments.baseUrl;
  private user?: User;

  constructor(private http: HttpClient) { }

  get currentUser():User | undefined {
    if ( !this.user ) return undefined;
    return structuredClone( this.user ); // es lo mismo que return ...this.user
  }

  login( email: string, password: string ):Observable<User> {
    // http.post('login',{ email, password });
    return this.http.get<User>(`${ this.baseUrl }/users/1`)
      .pipe(
        tap( user => this.user = user ), // da la propiedad de la clase
        tap( user => localStorage.setItem('token', 'aASDgjhasda.asdasd.aadsf123k' )), // lo guarda en el localStorage
      );
  }

  // para mantener la sesion del usuario dps de la autentificacion
  checkAuthentication(): Observable<boolean> {
    if ( !localStorage.getItem('token') ) return of(false); // si el usuario no esta autenticado
    const token = localStorage.getItem('token');

    return this.http.get<User>(`${ this.baseUrl }/users/1`)
      .pipe(
        tap( user => this.user = user ), // establece la propiedad user desde   private user?: User;
        map( user => !!user ), // el user trae un valor boolean. la doble negacion entrega el true === el usuario si trae informacion
        catchError( err => of(false) )
      );
  }

  logout() {
    this.user = undefined;
    localStorage.clear(); // borrar lo q se haya guardado en el localStorage
  }
}
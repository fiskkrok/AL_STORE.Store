import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { concatMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private userInfoEndpoint = 'https://dev-3on2otf3kmyxv53z.us.auth0.com/userinfo';

    constructor(private http: HttpClient, private auth: AuthService) { }

    getUserInfo(): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            concatMap(token => {
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${token}`
                });
                return this.http.get(this.userInfoEndpoint, { headers });
            })
        );
    }
}
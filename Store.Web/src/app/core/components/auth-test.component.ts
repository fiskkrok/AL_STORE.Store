import { Component, inject } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { HttpClient } from "@angular/common/http";
import { AsyncPipe, JsonPipe } from "@angular/common";

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `
    <div class="p-4 text-foreground" >
      <h2>Auth Test</h2>
      <div>
        <p>Is Authenticated: {{ auth.isAuthenticated$ | async }}</p>
        <p>User: {{ auth.user$ | async | json }}</p>
        <button (click)="testAuth()" class="px-4 py-2 bg-blue-500 text-white rounded">
          Test Auth Endpoint
        </button>
      </div>
    </div>
  `
})
export class AuthTestComponent {
  auth = inject(AuthService);
  http = inject(HttpClient);

  testAuth() {
    this.http.get('https://localhost:7002/api/auth/test').subscribe({
      next: (res: any) => console.log('Auth test success:', res),
      error: (err: any) => console.error('Auth test failed:', err)
    });
  }
}
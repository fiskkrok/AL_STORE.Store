import { input, ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-fatal-error',
    standalone: true,

    template: `
        <div class="fatal-error">
            <h1 class="fatal-error__title">Fatal Error</h1>
            <p class="fatal-error__message">
                @if(message()) {
                    {{ message() }}
                } @else {
                    An unexpected error occurred.
                }
            </p>
        </div>
    `,
    styles: [`
        .fatal-error {
            padding: 16px;
            border: 1px solid #e63946;
            background-color: #ffe6e6;
        }
        .fatal-error__title {
            font-size: 24px;
            margin-bottom: 8px;
            color: #e63946;
        }
        .fatal-error__message {
            font-size: 16px;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FatalErrorComponent {
    readonly message = input.required<string>();
}
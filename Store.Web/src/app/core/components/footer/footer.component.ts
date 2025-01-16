import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="w-full border-t bg-background">
      <div class="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div class="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with Angular. The source code is available on
          <a
            href="https://github.com/yourusername/store"
            target="_blank"
            rel="noreferrer"
            class="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </div>
        <nav class="flex items-center space-x-4 text-sm font-medium text-muted-foreground">
          <a routerLink="/terms" class="transition-colors hover:text-foreground">Terms</a>
          <a routerLink="/privacy" class="transition-colors hover:text-foreground">Privacy</a>
        </nav>
      </div>
    </footer>
  `,
})
export class FooterComponent { }
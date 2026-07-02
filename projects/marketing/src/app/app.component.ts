import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from "@angular/core";
import { RouterLink, RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { LinksService } from "./links.service";
import { MatToolbar } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";

@Component({
  selector: "mkt-root",
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbar,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  private links = inject(LinksService);
  private matIconRegistry = inject(MatIconRegistry);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
  if (isPlatformBrowser(this.platformId)) {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        const onSupport = e.urlAfterRedirects.split(/[?#]/)[0] === "/support";
        window.$chatwoot?.toggleBubbleVisibility(onSupport ? "hide" : "show");
      });
  }
}

  title = "glitchtip-marketing";
  registerLink = this.links.registerLink;
  loginLink = this.links.loginLink;
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  ngOnInit() {
    this.matIconRegistry.setDefaultFontSetClass("material-symbols-filled");
  }

}

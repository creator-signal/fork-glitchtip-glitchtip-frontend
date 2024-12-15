import { Component, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from "@angular/router";
import { lastValueFrom } from "rxjs";
import { SettingsService } from "./api/settings.service";
import { AuthService } from "./auth.service";
import { MatIconRegistry } from "@angular/material/icon";

@Component({
  selector: "gt-root",
  templateUrl: "./app.component.html",
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private settings: SettingsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private matIconRegistry: MatIconRegistry,
  ) {
    this.matIconRegistry.setDefaultFontSetClass("material-symbols-outlined");
  }

  ngOnInit() {
    this.settings.getSettings().subscribe();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const params = this.route.snapshot.firstChild?.params;
        const orgSlug = params ? params["org-slug"] : undefined;
        this.settings.triggerPlausibleReport(orgSlug);
      }
    });

    lastValueFrom(this.authService.checkServerAuthStatus());
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";

import { SettingsService } from "src/app/api/settings.service";
import { AuthService } from "src/app/auth.service";

import { selectZitadelProvider } from "./zitadel-provider";

@Component({
  selector: "gt-creator-signal-login",
  templateUrl: "./creator-signal-login.html",
  styleUrls: ["./creator-signal-login.scss"],
  imports: [MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorSignalLogin implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly settings = inject(SettingsService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly settingsLoaded = this.settings.initialLoad;
  protected readonly starting = signal(false);
  protected readonly zitadel = computed(() =>
    selectZitadelProvider(this.settings.socialApps()),
  );

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params["socialLoginError"]) {
        this.snackBar.open(
          $localize`ZITADEL could not complete the sign-in. Please try again.`,
        );
      }
    });
  }

  protected signIn() {
    const provider = this.zitadel();
    if (!provider || this.starting()) {
      return;
    }
    this.starting.set(true);
    let callbackUrl = "/login/finalize";
    const nextUrl = this.activatedRoute.snapshot.queryParamMap.get("next");
    if (nextUrl) {
      const callback = new URL(callbackUrl, window.location.origin);
      callback.searchParams.set("next", nextUrl);
      callbackUrl = callback.pathname + callback.search;
    }
    this.auth.providerRedirect(provider.provider, callbackUrl, "login");
  }
}

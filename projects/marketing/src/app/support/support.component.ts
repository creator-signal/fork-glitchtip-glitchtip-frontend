import {
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterLink } from "@angular/router";

const LICENSE_LOOKUP_URL =
  "https://app.glitchtip.com/api/0/billing/customer-by-email/";

const SUPPORT_EMAIL = "sales@glitchtip.com";

const LICENSE_KEY_FRAGMENT = /^#?(cus_[A-Za-z0-9]+)$/;

type SubmitState = "idle" | "submitting" | "sent" | "error";

@Component({
  selector: "mkt-support",
  imports: [
    MatCard,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: "./support.component.html",
  styleUrls: ["./support.component.scss"],
})
export class SupportComponent {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  protected email = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected state = signal<SubmitState>("idle");

  protected contactForm = new FormGroup({
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
  });

  protected licenseKeyFromUrl = signal<string | null>(null);

  protected isSubmitting = computed(() => this.state() === "submitting");

  protected hasLicenseKey = computed(() => !!this.licenseKeyFromUrl());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const match = window.location.hash.match(LICENSE_KEY_FRAGMENT);
      if (match) {
        this.licenseKeyFromUrl.set(match[1]);
      }
    }
  }

  composeSupportEmail() {
    const key = this.licenseKeyFromUrl();
    if (!key || this.contactForm.invalid) return;

    const { email, message } = this.contactForm.value;
    const subject = `Support Request - ${key}`;
    const body = `${message ?? ""}\n\n--\nLicense key: ${key}\nFrom: ${email ?? ""}`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  async submit() {
    if (this.email.invalid || this.isSubmitting()) return;
    this.state.set("submitting");
    try {
      await firstValueFrom(
        this.http.post(LICENSE_LOOKUP_URL, { email: this.email.value }),
      );
      this.state.set("sent");
    } catch {
      this.state.set("error");
    }
  }

  reset() {
    this.email.reset();
    this.state.set("idle");
  }
}

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { LoginResponse } from "../auth/auth.interfaces";
import { getStorageWithExpiry } from "src/app/shared/shared.utils";
import { SocialApp } from "../user/user.interfaces";

interface RestAuthConnectData {
  access_token?: string;
  code?: string;
  tags?: string | null;
}

function postForm(action: string, data: any) {
  const f = document.createElement("form");
  f.method = "POST";
  f.action = action;

  for (const key in data) {
    const d = document.createElement("input");
    d.type = "hidden";
    d.name = key;
    d.value = data[key];
    f.appendChild(d);
  }
  document.body.appendChild(f);
  f.submit();
}

function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
export function getCSRFToken() {
  return getCookie("csrftoken");
}

@Injectable({
  providedIn: "root",
})
export class GlitchTipOAuthService {
  private readonly baseUrl = "rest-auth";

  constructor(private http: HttpClient) {}

  getAnalyticsTags() {
    return getStorageWithExpiry("register");
  }

  completeOAuthLogin(
    provider: string,
    isConnect: boolean,
    accessToken: string | null,
    code: string | null,
  ) {
    let data: RestAuthConnectData = {};
    if (accessToken) {
      data = {
        access_token: accessToken,
        tags: this.getAnalyticsTags(),
      };
    } else if (code) {
      data = {
        code,
        tags: this.getAnalyticsTags(),
      };
    }
    let url = this.baseUrl + "/" + provider + "/";
    if (isConnect) {
      url += "connect/";
    }
    return this.http.post<LoginResponse>(url, data);
  }

  // /** Redirect user to OAuth provider auth URL */
  initOAuthLogin(socialApp: SocialApp) {
    postForm("/_allauth/browser/v1/auth/provider/redirect", {
      provider: socialApp.provider,
      process: "login",
      callback_url: "/account/provider/callback",
      csrfmiddlewaretoken: getCSRFToken(),
    });
  }
}

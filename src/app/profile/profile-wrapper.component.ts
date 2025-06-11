import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { UserService } from "../api/user/user.service";
import { TopAppBarComponent } from "src/app/shared/top-app-bar/top-app-bar.component";

@Component({
  selector: "gt-profile",
  templateUrl: "./profile-wrapper.component.html",
  styleUrls: ["./profile-wrapper.component.scss"],
  imports: [RouterOutlet, TopAppBarComponent],
})
export class ProfilWrapperComponent {
  private userService = inject(UserService);

  user = this.userService.user;
}

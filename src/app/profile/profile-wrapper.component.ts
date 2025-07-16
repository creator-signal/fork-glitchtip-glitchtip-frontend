import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { UserService } from "../api/user/user.service";

@Component({
  selector: "gt-profile",
  templateUrl: "./profile-wrapper.component.html",
  styleUrls: ["./profile-wrapper.component.scss"],
  imports: [RouterOutlet],
})
export class ProfilWrapperComponent {
  private userService = inject(UserService);

  user = this.userService.user;
}

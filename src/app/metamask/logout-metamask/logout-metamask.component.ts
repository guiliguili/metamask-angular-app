import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { MetaMaskService } from "../metamask.service";

@Component({
  selector: "app-logout-metamask",
  templateUrl: "./logout-metamask.component.html",
  styleUrls: ["./logout-metamask.component.css"],
})
export class LogoutMetamaskComponent implements OnInit {
  protected error$ = new BehaviorSubject<string | undefined>(undefined);
  protected success$ = new BehaviorSubject<string | undefined>(undefined);

  constructor(private metaMaskService: MetaMaskService) {}

  ngOnInit(): void {}

  onLogout(): void {
    this.error$.next(undefined);
    this.success$.next(undefined);
    this.metaMaskService.logout().catch((err) => {
      console.error(err);
      this.error$.next(err);
    });
  }
}

import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { MetaMaskService } from "../metamask.service";
import { BehaviorSubject, Subscription } from "rxjs";

declare var window: any;

@Component({
  selector: "app-login-metamask",
  templateUrl: "./login-metamask.component.html",
  styleUrls: ["./login-metamask.component.css"],
})
export class LoginMetaMaskComponent implements OnDestroy {
  protected subscriptions = new Subscription();
  protected error$ = new BehaviorSubject<string | undefined>(undefined);
  protected success$ = new BehaviorSubject<string | undefined>(undefined);

  protected networkVersion: number | undefined;

  constructor(protected metaMaskService: MetaMaskService) {}

  ngOnInit(): void {
    if (this.metaMaskService.isEthereumInstalled) {
      this.metaMaskService.requestAccount();
      this.subscriptions.add(
        this.metaMaskService.networkVersion.subscribe((networkVersion) => {
          console.log("networkVersion changed", networkVersion);
          this.networkVersion = networkVersion;
        })
      );
    }
  }

  onLogin(): void {
    this.error$.next(undefined);
    this.success$.next(undefined);
    this.metaMaskService.login().catch((err) => {
      console.error(err);
      this.error$.next(err);
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

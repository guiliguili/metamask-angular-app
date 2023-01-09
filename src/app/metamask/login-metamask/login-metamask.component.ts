import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { MetaMaskService } from "../metamask.service";

declare var window: any;

@Component({
  selector: "app-login-metamask",
  templateUrl: "./login-metamask.component.html",
  styleUrls: ["./login-metamask.component.css"],
})
export class LoginMetaMaskComponent implements OnDestroy {
  protected subscriptions = new Subscription();
  protected error$ = new BehaviorSubject<string | undefined>(undefined);

  get isConnected$() {
    return this.metaMaskService.isConnected$;
  }

  get account$() {
    return this.metaMaskService.account$;
  }

  get isAuthenticated$() {
    return this.metaMaskService.isAuthenticated$;
  }

  constructor(
    protected changeDetectorRef: ChangeDetectorRef,
    protected metaMaskService: MetaMaskService
  ) {}

  ngOnInit(): void {
    this.changeDetectorRef.detectChanges();
    this.subscriptions.add(
      this.account$.subscribe((_) => {
        this.changeDetectorRef.detectChanges();
      })
    );
    this.subscriptions.add(
      this.isAuthenticated$.subscribe((_) => {
        this.changeDetectorRef.detectChanges();
      })
    );
    this.subscriptions.add(
      this.isConnected$.subscribe((_) => {
        this.changeDetectorRef.detectChanges();
      })
    );
  }

  onLogin(): void {
    this.error$.next(undefined);
    this.metaMaskService
      .requestLogin()
      .then((account) => console.log(`Login for '${account}' succeeded`))
      .catch((err) => this.error$.next(`Login failed ${err.message}`));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

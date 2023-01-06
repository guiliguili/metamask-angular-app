import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import { MetaMaskService } from "../metamask.service";

const merchantETHAddress = "0x65be1967fe184FC045819fe3E41c08B98Ca5Ad72";

@Component({
  selector: "app-send-transaction-metamask",
  templateUrl: "./send-transaction-metamask.component.html",
  styleUrls: ["./send-transaction-metamask.component.css"],
})
export class SendTransactionMetamaskComponent implements OnInit {
  protected error$ = new BehaviorSubject<string | undefined>(undefined);
  protected success$ = new BehaviorSubject<string | undefined>(undefined);
  protected txHash$ = new BehaviorSubject<string | undefined>(undefined);

  protected form: FormGroup = this.fb.group({
    amount: ["", Validators.required],
  });

  get amountControl(): FormControl {
    return this.form.controls["amount"] as FormControl;
  }

  get amount(): string {
    return this.amountControl.value;
  }

  get networkVersion() {
    return this.metaMaskService.networkVersion;
  }

  constructor(
    protected fb: FormBuilder,
    protected metaMaskService: MetaMaskService
  ) {}

  ngOnInit(): void {}

  onSendTransaction(): void {
    this.error$.next(undefined);
    this.metaMaskService
      .sendTransaction(false, merchantETHAddress, this.amount)
      .then((txHash) => {
        console.log("txHash: " + txHash);
        this.txHash$.next(txHash);
        if (txHash === null) {
          console.error("Transaction failed");
        }
      })
      .catch((err) => {
        console.error(err);
        this.error$.next(err);
      });
  }
}

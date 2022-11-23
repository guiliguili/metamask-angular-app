import { Component, OnInit } from '@angular/core';
import { MetaMaskService } from "../metamask.service";

@Component({
  selector: 'app-check-transaction-metamask',
  templateUrl: './check-transaction-metamask.component.html',
  styleUrls: ['./check-transaction-metamask.component.css']
})
export class CheckTransactionMetamaskComponent implements OnInit {

  transactionSuccessful = false;

  constructor(private metaMaskService: MetaMaskService) { }

  ngOnInit(): void {
  }

  onCheckTransaction(): void {
    this.transactionSuccessful = false;

    this.metaMaskService.checkTransactionConfirmation(this.metaMaskService.getTxhash()).then((res) => {
      if (res != null)
      {
        console.log("Transaction " + this.metaMaskService.getTxhash() + " successful - " + res);
        this.transactionSuccessful = true;
      }
      else
        console.log("Transaction " + this.metaMaskService.getTxhash() + " not completed");
    });
  }

}

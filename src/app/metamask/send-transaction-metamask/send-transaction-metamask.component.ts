import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetaMaskService } from "../metamask.service";

@Component({
  selector: 'app-send-transaction-metamask',
  templateUrl: './send-transaction-metamask.component.html',
  styleUrls: ['./send-transaction-metamask.component.css']
})
export class SendTransactionMetamaskComponent implements OnInit {

  subscriptionMetaMaskAddress : Subscription;
  metaMaskAddress = "";

  txHash = null;
  transactionSuccessful = false;

  amountETH = 0.0006;
  merchantETHAddress = '0x65be1967fe184FC045819fe3E41c08B98Ca5Ad72'
  
  constructor(private metaMaskService: MetaMaskService) {}

  ngOnInit(): void {
  }

  onSendTransaction(): void {
    this.metaMaskService.clearErrorMessage;
    this.txHash = null;
    this.metaMaskService.setTxhash(null);
    this.metaMaskService.sendTransaction(false, this.metaMaskService.getMetaMaskAddress(), this.merchantETHAddress, this.amountETH).then((txHash) => {
      if (txHash != null)
      {
        console.log("txHash: " + txHash);
        this.metaMaskService.setTxhash(txHash);
        this.txHash = txHash;
      }
      else {
        this.metaMaskService.sendErrorMessage('Transaction failed');
      }
    }); 
  }

}

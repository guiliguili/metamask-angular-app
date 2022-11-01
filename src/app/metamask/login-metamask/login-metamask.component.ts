import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { SignatureService } from "./../signature.service";

declare var window: any

@Component({
  selector: "app-root",
  templateUrl: "./login-metamask.component.html",
  styleUrls: ["./login-metamask.component.css"]
})
export class LoginMetaMaskComponent {
  randomBackendNumber = Math.floor(Math.random() * 1000000);
  signMessage = "To authenticate my account, I am signing with the nonce " + this.randomBackendNumber;
  isMetamaskInstalled = false;
  isAuthenticatedWithMetaMask = false;
  metaMaskAddress = "";
  networkVersion = window.ethereum.networkVersion;
  txHash = null;
  transactionSuccessful = false;
  
  errorMessage = "";
  amountETH = 0.0006;
  merchantETHAddress = '0x65be1967fe184FC045819fe3E41c08B98Ca5Ad72'

  constructor(
    private signatureService: SignatureService
  ) 
  {
    this.isMetamaskInstalled = this.signatureService.isMetamaskInstalled();

    console.log("isMetamaskInstalled: " + this.isMetamaskInstalled);

    this.signatureService.getAddress().then((address) => {
      this.metaMaskAddress = address;
      console.log("Account address: " + address);
    });
  }

  onSubmit(): void {
    this.errorMessage = "";    
    console.log("Message to be be signed is: ", this.signMessage);

    this.signatureService.signMessage(this.signMessage).then((res) => {
      if (res != null)
      {
        console.log("Signature: " + res.signature);
        //We should validate the signature on the backend server first
        this.metaMaskAddress = res.address;
        this.isAuthenticatedWithMetaMask = true;
      }
      else {
        this.errorMessage = "Signature failed"
      }
    });
  }

  onLogout(): void {
    this.isAuthenticatedWithMetaMask = false;
  }

  onSendTransaction(): void {
    this.errorMessage = "";
    this.txHash = null;
    this.signatureService.sendTransaction(false, this.metaMaskAddress, this.merchantETHAddress, this.amountETH).then((txHash) => {
      if (txHash != null)
      {
        console.log("txHash: " + txHash);
        this.txHash = txHash;
      }
      else {
        this.errorMessage = "Transaction failed";
      }
    }); 
  }

  onCheckTransaction(): void {
    this.transactionSuccessful = false;

    this.signatureService.checkTransactionConfirmation(this.txHash).then((res) => {
      if (res != null)
      {
        console.log("Transaction " + this.txHash + " successful - " + res);
        this.transactionSuccessful = true;
      }
      else
        console.log("Transaction " + this.txHash + " not completed");
    });
  }
}

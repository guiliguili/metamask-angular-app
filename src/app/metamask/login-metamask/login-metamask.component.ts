import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MetaMaskService } from "../metamask.service";

declare var window: any

@Component({
  selector: "app-root",
  templateUrl: "./login-metamask.component.html",
  styleUrls: ["./login-metamask.component.css"]
})
export class LoginMetaMaskComponent {
  signMessage = "";
  isMetamaskInstalled = false;
  isAuthenticatedWithMetaMask = false;
  metaMaskAddress = "";
  networkVersion = window.ethereum.networkVersion;
  txHash = null;
  transactionSuccessful = false;
  errorMessage = null;

  amountETH = 0.0006;
  merchantETHAddress = '0x65be1967fe184FC045819fe3E41c08B98Ca5Ad72'

  constructor(
    private metaMaskService: MetaMaskService
  ) 
  {
    this.isMetamaskInstalled = this.metaMaskService.isMetamaskInstalled();

    console.log("isMetamaskInstalled: " + this.isMetamaskInstalled);

    this.metaMaskService.getAddress().then((address) => {
      this.metaMaskAddress = address;
      console.log("Account address: " + address);
    });

    window.ethereum.on('chainChanged', (chainId) => {
      // Handle the new chain.
      // Correctly handling chain changes can be complicated.
      // We recommend reloading the page unless you have good reason not to.
      this.networkVersion = chainId;
      window.location.reload();
    });    
  }

  onLogin(): void {
    this.errorMessage = "";

    this.metaMaskService.generateNonce().then((res) => {
      this.signMessage = res.nonce;
      console.log("Message to be be signed is: ", this.signMessage);

      this.metaMaskService.signMessage(this.signMessage).then((res) => {

        if (res != null)
        {
          console.log("Signature: " + res.signature);
          this.metaMaskAddress = res.address;
          //Validate the signature on the backend server first
          this.metaMaskService.verifyMessage(this.signMessage, res.address, res.signature).then((res) => {
            if (res.valid == true)
            {
              console.log("Authenticated");
              this.isAuthenticatedWithMetaMask = true;
            }
            else {
              this.errorMessage = "Signature invalid "
            }
          }).catch((err) => {
            console.error(err);
            this.errorMessage = "Unable to verify the message"
          });
        }
        else {
          this.errorMessage = "Signature failed"
        }
      });
    });


  }

  onLogout(): void {
    this.isAuthenticatedWithMetaMask = false;
    this.errorMessage = null;
  }

  onSendTransaction(): void {
    this.errorMessage = "";
    this.txHash = null;
    this.metaMaskService.sendTransaction(false, this.metaMaskAddress, this.merchantETHAddress, this.amountETH).then((txHash) => {
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

    this.metaMaskService.checkTransactionConfirmation(this.txHash).then((res) => {
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

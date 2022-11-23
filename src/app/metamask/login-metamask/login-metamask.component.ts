import { Component } from "@angular/core";
import { MetaMaskService } from "../metamask.service";
import { Subscription } from 'rxjs';

declare var window: any

@Component({
  selector: "app-login-metamask",
  templateUrl: "./login-metamask.component.html",
  styleUrls: ["./login-metamask.component.css"]
})
export class LoginMetaMaskComponent {
  subscriptionErrorMessage: Subscription;
  subscriptionIsAuthenticatedWithMetaMask: Subscription;  

  signMessage = "";
  isMetamaskInstalled = false;
  isAuthenticatedWithMetaMask = false;
  errorMessage = null;

  metaMaskAddress = "";
  networkVersion;

  constructor(
    private metaMaskService: MetaMaskService
  ) {}

  ngOnInit(): void {
    this.subscriptionErrorMessage = this.metaMaskService.getErrorMessage().subscribe(errorMessage => {
      console.log("Receive change error message event " + errorMessage);
      if (errorMessage) {
        this.errorMessage = errorMessage;
      } else {
        this.errorMessage = "";
      }
    });

    this.subscriptionIsAuthenticatedWithMetaMask = this.metaMaskService.getIsAuthenticatedWithMetaMask().subscribe(isAuthenticatedWithMetaMask => {
      console.log("Receive isAuthenticatedWithMetaMask event " + isAuthenticatedWithMetaMask); 
      this.isAuthenticatedWithMetaMask = isAuthenticatedWithMetaMask;
    });

    this.isMetamaskInstalled = this.metaMaskService.isMetamaskInstalled();
    console.log("isMetamaskInstalled: " + this.isMetamaskInstalled);

    if (this.isMetamaskInstalled)
    {
      this.networkVersion = window.ethereum.networkVersion;
      this.metaMaskService.setNetworkVersion(this.networkVersion);

      this.metaMaskService.getAddress().then((address) => {
        this.metaMaskAddress = address;
        this.metaMaskService.setMetaMaskAddress(this.metaMaskAddress);
        console.log("Account address init: " + this.metaMaskAddress);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        this.networkVersion = chainId;
        this.metaMaskService.setNetworkVersion(chainId);
        window.location.reload();
      });
    } 
  }

  onLogin(): void {
    this.metaMaskService.clearErrorMessage();

    this.metaMaskService.generateNonce().then((res) => {
      this.signMessage = res.nonce;
      console.log("Message to be be signed is: ", this.signMessage);

      this.metaMaskService.signMessage(this.signMessage).then((res) => {

        if (res != null)
        {
          console.log("Signature: " + res.signature);
          this.metaMaskAddress = res.address;
          this.metaMaskService.setMetaMaskAddress(this.metaMaskAddress);
          console.log("Account address login: " + this.metaMaskAddress);
          //Validate the signature on the backend server first
          this.metaMaskService.verifyMessage(this.signMessage, res.address, res.signature).then((res) => {
            if (res.valid == true)
            {
              console.log("Authenticated");
              this.metaMaskService.setIsAuthenticatedWithMetaMask(true);
            }
            else {
              //this.errorMessage = "Signature invalid"
              this.metaMaskService.sendErrorMessage('Signature invalid');
            }
          }).catch((err) => {
            console.error(err);
            //this.errorMessage = "Unable to verify the message"
            this.metaMaskService.sendErrorMessage('Unable to verify the message');
          });
        }
        else {
          //this.errorMessage = "Signature failed"
          this.metaMaskService.sendErrorMessage('Signature failed');
        }
      });
    }).catch((err) => {
      console.error(err);
      //this.errorMessage = "Unable to login"
      this.metaMaskService.sendErrorMessage('Unable to login');
    });

  }

  ngOnDestroy() {
    this.subscriptionErrorMessage.unsubscribe();
    this.subscriptionIsAuthenticatedWithMetaMask.unsubscribe();
  }

}

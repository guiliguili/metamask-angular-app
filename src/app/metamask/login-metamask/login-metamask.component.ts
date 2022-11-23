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

  signMessage;

  constructor(
    private metaMaskService: MetaMaskService
  ) {}

  ngOnInit(): void {
    if (this.metaMaskService.getIsMetaMaskInstalled())
    {
      this.metaMaskService.setNetworkVersion(window.ethereum.networkVersion);

      this.metaMaskService.requestMetaMaskAddress().then((address) => {
        this.metaMaskService.setMetaMaskAddress(address);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        this.metaMaskService.setNetworkVersion(chainId);
        window.location.reload();
      });
    } 
  }

  onLogin(): void {
    this.metaMaskService.setErrorMessage(null);

    this.metaMaskService.generateNonce().then((res) => {
      this.signMessage = res.nonce;
      console.log("Message to be be signed is: ", this.signMessage);

      this.metaMaskService.signMessage(this.signMessage).then((res) => {

        if (res != null)
        {
          console.log("Signature: " + res.signature);
          this.metaMaskService.setMetaMaskAddress(res.address);
          //Validate the signature on the backend server first
          this.metaMaskService.verifyMessage(this.signMessage, res.address, res.signature).then((res) => {
            if (res.valid == true)
            {
              console.log("Authenticated");
              this.metaMaskService.setIsAuthenticatedWithMetaMask(true);
            }
            else {
              //this.errorMessage = "Signature invalid"
              this.metaMaskService.setErrorMessage('Signature invalid');
            }
          }).catch((err) => {
            console.error(err);
            //this.errorMessage = "Unable to verify the message"
            this.metaMaskService.setErrorMessage('Unable to verify the message');
          });
        }
        else {
          //this.errorMessage = "Signature failed"
          this.metaMaskService.setErrorMessage('Signature failed');
        }
      });
    }).catch((err) => {
      console.error(err);
      //this.errorMessage = "Unable to login"
      this.metaMaskService.setErrorMessage('Unable to login');
    });

  }

  ngOnDestroy() {
  }

}

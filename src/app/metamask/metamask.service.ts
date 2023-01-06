import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ethers } from "ethers";
import { Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";

declare var window: any;

interface Nonce {
  nonce?: string;
}

@Injectable({
  providedIn: "root",
})
export class MetaMaskService {
  protected apiURL = "";

  protected provider?: ethers.providers.Web3Provider;

  protected networkVersion$ = new Subject<number | undefined>();
  protected account$ = new Subject<string | undefined>();
  protected authenticated$ = new Subject<boolean>();

  get ethereum(): any {
    return window.ethereum;
  }

  get isEthereumInstalled(): boolean {
    return typeof window.ethereum !== "undefined";
  }

  get isMetaMask(): boolean {
    return this.isEthereumInstalled && (this.ethereum.isMetaMask ?? false);
  }

  get networkVersion(): Observable<number | undefined> {
    return this.networkVersion$.asObservable();
  }

  get account(): Observable<string | undefined> {
    return this.account$.asObservable();
  }

  get isAuthenticated(): Observable<boolean> {
    return this.authenticated$.asObservable();
  }

  constructor(private httpClient: HttpClient) {
    this.apiURL = environment.easyRestURL;
    if (this.isEthereumInstalled) {
      this.provider = new ethers.providers.Web3Provider(this.ethereum, "any");
      this.ethereum.on("accountsChanged", (accounts: string[]) =>
        this.onAccountsChanged(accounts)
      );
      this.ethereum.on("chainChanged", (chainId: string) =>
        this.onChainChanged(chainId)
      );
    }
  }

  protected getBackendUrl(path: string): string {
    return `${this.apiURL}${path}`;
  }

  protected onAccountsChanged(accounts: string[]) {
    console.log("onAccountsChanged", accounts);
    if (accounts === undefined || accounts.length == 0) {
      this.account$.next();
      this.networkVersion$.next();
    } else {
      const account = accounts[0];

      if (accounts.length > 1) {
        console.warn("More than one account connected");
      }
      this.account$.next(account);
      this.networkVersion$.next(this.provider?.network?.chainId);
    }
    this.authenticated$.next(false);
  }

  protected onChainChanged(chainId: string) {
    console.log("onChainChanged", chainId);
    this.provider
      ?.getNetwork()
      .then((network) => this.networkVersion$.next(network.chainId));
  }

  protected async getSigner() {
    await this.requestAccount();
    const signer = this.provider?.getSigner();
    return signer;
  }

  protected generateNonce = async () => {
    let nonce = await this.httpClient
      .get<Nonce>(this.getBackendUrl("/metamask/generatenonce"))
      .pipe()
      .toPromise();
    return nonce;
  };

  protected verifyMessage = async (
    message: string,
    address: string,
    signature: string
  ) => {
    let params = new HttpParams();
    params = params.append("message", message);
    params = params.append("address", address);
    params = params.append("signature", signature);

    const options = { params: params };
    let verifyMessageResponse = await this.httpClient
      .get<any>(this.getBackendUrl("/metamask/verify/message"), options)
      .toPromise();
    return verifyMessageResponse;
  };

  requestAccount = async () => {
    return this.provider
      ?.send("eth_requestAccounts", [])
      .then((accounts) => this.onAccountsChanged(accounts));
  };

  login = async () => {
    this.authenticated$.next(false);

    const signer = await this.getSigner();
    const res = await this.generateNonce();
    const nonce = res.nonce;

    console.log("Message to be be signed is: ", nonce);

    if (nonce === undefined) {
      throw Error("Could not generate nonce!");
    } else {
      const signature = await signer?.signMessage(nonce);
      if (signature === undefined) {
        throw Error("Could not sign message!");
      } else {
        const address = await signer?.getAddress();

        if (address === undefined) {
          throw Error("Could not get address!");
        } else {
          const res = await this.verifyMessage(nonce, address, signature);
          if (res.valid == true) {
            console.log("Authenticated");
            this.authenticated$.next(true);
          } else {
            throw new Error("Signature invalid");
          }
        }
      }
    }
  };

  logout = async () => {
    this.authenticated$.next(false);
  };

  sendTransaction = async (
    isProd: boolean,
    toAdress: string,
    amountETH: string
  ) => {
    const networkVersion = await this.networkVersion$.toPromise();
    if (isProd && networkVersion !== 1) {
      throw Error("Network should be Ethereum mainnet");
    }

    if (!isProd && networkVersion === 1) {
      throw Error("Network should be a testnet");
    }

    const signer = await this.getSigner();
    const tx = await signer?.sendTransaction({
      to: toAdress,
      value: ethers.utils.parseEther(amountETH).toHexString(),
    });

    if (tx === undefined) {
      throw Error("Could not send transaction");
    } else {
      return tx?.hash;
    }
  };

  checkTransactionConfirmation = async (txHash: string) => {
    const receipt = await this.provider?.getTransactionReceipt(txHash);
    return receipt;
  };

  checkTransactionConfirmationFromBackend = async (_txhash: string) => {
    const receipt = null;
    return receipt;
  };
}

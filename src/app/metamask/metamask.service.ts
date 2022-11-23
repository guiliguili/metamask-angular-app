import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { ethers } from "ethers";
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';

declare var window: any

@Injectable({
  providedIn: "root"
})
export class MetaMaskService {

  apiURL = "";
  errorMessage: String;
  isMetaMaskInstalled: boolean;
  networkVersion:String;
  metaMaskAddress:String;
  isAuthenticatedWithMetaMask: boolean;  
  txhash: String;
  isTransactionSuccessful: boolean;


  constructor(private httpClient: HttpClient)
  {
    this.apiURL = environment.apiURL;
    this.isMetaMaskInstalled = false;
    this.networkVersion=null;    
    this.clearContext();

    var isMetaMaskInstalled = this.checkMetaMaskInstalled();
    this.setIsMetaMaskInstalled(isMetaMaskInstalled);    
  }

  clearContext() {
    this.errorMessage = null;
    this.metaMaskAddress = null;
    this.isAuthenticatedWithMetaMask = false;
    this.txhash = null;
    this.isTransactionSuccessful = false;     
  }  

  getErrorMessage() {
    return this.errorMessage;
  }

  setErrorMessage(errorMessage: string) {
    this.errorMessage = errorMessage;
  }

  getIsMetaMaskInstalled() {
    return this.isMetaMaskInstalled;
  }

  setIsMetaMaskInstalled(isMetaMaskInstalled: boolean) {  
    this.isMetaMaskInstalled = isMetaMaskInstalled;
  }

  getNetworkVersion() {
    return this.networkVersion;
  }  

  setNetworkVersion(networkVersion: string) {
    this.networkVersion = networkVersion;
  }

  getMetaMaskAddress() {
    return this.metaMaskAddress;
  }  

  setMetaMaskAddress(metaMaskAddress: string) {
    this.metaMaskAddress = metaMaskAddress;
  }

  getIsAuthenticatedWithMetaMask() {
    return this.isAuthenticatedWithMetaMask;
  }

  setIsAuthenticatedWithMetaMask(isAuthenticatedWithMetaMask: boolean) {  
    this.isAuthenticatedWithMetaMask = isAuthenticatedWithMetaMask;
  }  

  getTxhash() {
    return this.txhash;
  }  

  setTxhash(txhash: string) {
    this.txhash = txhash;
  }

  getIsTransactionSuccessful() {
    return this.isTransactionSuccessful;
  }
  
  setIsTransactionSuccessful(isTransactionSuccessful: boolean) {
    this.isTransactionSuccessful = isTransactionSuccessful;
  }  

  checkMetaMaskInstalled() {
    return window.ethereum != null && window.ethereum.isMetaMask;
  };

  requestMetaMaskAddress = async () => {
    const address = await window.ethereum.request({ method: "eth_accounts" });
    return address;
  };

  generateNonce = async () => {
    let params = new HttpParams();
    const options = { params: params};
    let nonce = await this.httpClient.get<any>(this.apiURL + '/metamask/generatenonce',).toPromise();
    return nonce;
  };

  signMessage = async (message) => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      const address = await signer.getAddress();

      return { signature: signature, address: address}; 
    } catch (err) {
      console.log("Unable to sign: " + err);
    }
  };

  verifyMessage = async (message, address, signature) => {
    let params = new HttpParams();
    params = params.append('message', message);
    params = params.append('address', address);    
    params = params.append('signature', signature);

    const options = { params: params  };
    let verifyMessageResponse = await this.httpClient.get<any>(this.apiURL + '/metamask/verify/message', options).toPromise();
    return verifyMessageResponse
  };

  sendTransaction = async (isProd, fromAddress, toAdress, amountETH) => {
    try {
      const networkVersion = window.ethereum.networkVersion;
      if (isProd && networkVersion !=1)
      {
        throw "Network should be Ethereum mainnet";
      }
     
      if (!isProd && networkVersion==1)
      {
        throw "Network should be a testnet";
      }

      const amountWEIDec = amountETH * Math.pow(10, 18); //Convert from ETH to WEI 
      const amountWEIHex = amountWEIDec.toString(16); //Convert from DEC to HEX

      const transactionParameters = {
        nonce: '0x00', // ignored by MetaMask
        //gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
        //gas: '0x2710', // customizable by user during MetaMask confirmation.
        to: toAdress, // Required except during contract publications.
        from: fromAddress, // must match user's active address.
        value: amountWEIHex, 
        data:
          '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
        chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };

       const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return txHash; 
    } catch (err) {
      console.log("Unable to send transaction: " + err);
    }
  };

  checkTransactionConfirmation = async (txhash) => {
    const receipt = await window.ethereum.request({method:'eth_getTransactionReceipt', params:[txhash]})
    return receipt;
  }

  checkTransactionConfirmationFromBackend = async (txhash) => {
    const receipt = null;
    return receipt;
  }

}

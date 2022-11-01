import { Injectable } from "@angular/core";
import { ethers } from "ethers";
import { nextTick } from "process";

declare var window: any

@Injectable({
  providedIn: "root"
})
export class SignatureService {
  isMetamaskInstalled() {
    return window.ethereum != null && window.ethereum.isMetaMask;
  };

  getAddress = async () => {
    const address = await window.ethereum.request({ method: "eth_accounts" });
    return address;
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

}

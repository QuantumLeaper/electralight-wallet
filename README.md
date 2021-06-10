![ Wallet](https://uplexa.com/img/uplexa-wallet-screenshots/uplexa-wallet.png)

Lightweight GUI Wallet for the uPlexa Currency (UPX)

---

Meet ElectraLight, the new Electron based  Wallet. This initial release already brings several improvements over previous GUI wallet.

- Wallet switch option.
You can keep several wallets on one PC, and switch between them easily - just pick your  wallet from the list and enter your password.

- Wallet naming and identifying
Easily identify your wallets - you can give names to them, and each wallet has its own unique identicon image.

- Mixed sync. logic
Use the best from both ways of sync: remote (speed) and local (reliability). At wallet startup, you connect to remote node granting quicker operation state. At the same time, you download blockchain files on your hard drive. It will add more reliability to wallet operation. If remote connection fails, you will have local node running. You can also choose to run as normal full node or lite option.

- Power user settings
You may rely on predefined optimum settings, or you can edit settings (list will be expanded):
  - Sync. switch (mixed/local/remote)
  - Lmdb storage path
  - Various ports (daemon, p2p, uplexad, remote etc)
  - Remote node URL
  - Bandwidth utilization (upload/download speed)

- Improved address book
Adding recipients into your address book will let you keep track of who you have sent funds to - you can add recipients of your payments beforehand, or after transactions. Seamless  address validation of fields is built into the address book.

- Lazy load tx history tab
Scroll down and check your transactions list without pagination

- Interface updates
Resizable window with various UX improvements over previous version

- Increased stability and response time
Known issue with stuck processes after closing GUI wallet is now a past history. Overall increased speed and reduced response time of wallet's interface.

- Non latin seed restore
Restore your wallet with non-latin characters (Russian, German, Chinese and other languages)

- Import wallet from old GUI
 wallet will scan default folders used by the original GUI wallet and will give ability to restore from key files.


### Building from source

```
npm install -g quasar-cli
git clone https://github.com/quantumleaper/eleralight-wallet
cd electralight-wallet
cp /path/to/uplexa/binaries/uplexad bin/
cp /path/to/uplexa/binaries/uplexa-wallet-rpc bin/
npm install
npm run build
```

---

### LICENSE

Copyright (c) 2018-2019 uPlexa Project

Portions of this software are available under BSD-3 license. Please see ORIGINAL-LICENSE for details

All rights reserved.

Authors and copyright holders give permission for following:

1. Redistribution and use in source and binary forms WITHOUT modification.

2. Modification of the source form for your own personal use.

As long as the following conditions are met:

3. You must not distribute modified copies of the work to third parties. This includes
   posting the work online, or hosting copies of the modified work for download.

4. Any derivative version of this work is also covered by this license, including point 8.

5. Neither the name of the copyright holders nor the names of the authors may be
   used to endorse or promote products derived from this software without specific
   prior written permission.

6. You agree that this licence is governed by and shall be construed in accordance
   with the laws of England and Wales.

7. You agree to submit all disputes arising out of or in connection with this licence
   to the exclusive jurisdiction of the Courts of England and Wales.

Authors and copyright holders agree that:

8. This licence expires and the work covered by it is released into the
   public domain on 1st of August 2019

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

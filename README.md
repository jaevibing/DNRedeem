# DNRedeem
An extension to fake redeem Google Play gift card codes for the purposes of scambaiting.

A redux of PS Faker, removing bugs, improving the UI and adding more functionality.

Works only on Chromium-based browsers.

NOTE: This extension does not add balance to your Google Play account, nor does it redeem valid gift card codes.

### Installing
Google Chrome
1. Go to the [releases](https://github.com/jaevibing/DNRedeem/releases) tab of this repository
2. Choose your version, either normal or stealth (stealth disguises the extension as an adblocker, normal does not)
3. Once chosen, download it by clicking it
4. Once downloaded, unzip the file.
5. Next, go to your [extensions settings](chrome://extensions).
6. Turn on developer mode by pressing the switch in the top right
7. Press the button "Load Unpacked"
8. Select the unzipped folder
9. Congratulations! The extension should now work on Google Play. [Try it out!](https://play.google.com/store/games?code)

### Features
Set Value of Gift Card
- By ending the gift card number with a specific string of characters you can change the amount that is redeemed.
- Ending with 25 makes it $250, 20 $200, 10 $100, 05 $50, 02 $20
- Not doing this will have the value default to $500.
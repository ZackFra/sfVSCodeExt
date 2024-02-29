# dev-force README

Dev-Force is a VS Code extension to allow ease of use when developing for Salesforce.

## Features

### Execute Anonymous
For any apex file, you can right click the file in your editor or in the file explorer and click "Execute anonymous".
The extension will anonymously run the code in whichever org you are currently authorized to and output the results
into an output.log file.

### Execute Anonymous With Debug
Same as execute anonymous except is greps (really "Select-String") the file for USER_DEBUG lines.

## Requirements

This extension requires the latest version of sfdx.

## Extension Settings

N/A

## Known Issues

N/A

## Release Notes

### 1.0.0

Initial release. Includes the functionality listed above.
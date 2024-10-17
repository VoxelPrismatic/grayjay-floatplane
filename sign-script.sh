#!/bin/zsh
#Example usage:
#cat script.js | sign-script.sh
#sh sign-script.sh script.js

npx rollup -c

#Set your key paths here
PRIVATE_KEY_PATH=/home/$USER/.ssh/grayjay_rsa
PUBLIC_KEY_PATH=/home/$USER/.ssh/grayjay_rsa.pub
CONFIG=FloatplaneConfig.json
JAVASCRIPT=./build/FloatplaneScript.js

if [ ! -f "$PRIVATE_KEY_PATH" ]; then
    ssh-keygen -m pkcs8 -f "$PRIVATE_KEY_PATH" -N ""
fi

PUBLIC_KEY_PKCS8=$(ssh-keygen -f "$PUBLIC_KEY_PATH" -e -m pkcs8 | tail -n +2 | head -n -1 | tr -d '\n')
echo "This is your public key: '$PUBLIC_KEY_PKCS8'"

DATA=$(cat $JAVASCRIPT)
SIGNATURE=$(echo -n "$DATA" | openssl dgst -sha512 -sign $PRIVATE_KEY_PATH | base64 -w 0)
echo "This is your signature: '$SIGNATURE'"


cat $CONFIG | jq --arg scriptUrl "./build/FloatplaneScript.js" --arg signature "$SIGNATURE" --arg publicKey "$PUBLIC_KEY_PKCS8" '. + {scriptSignature: $signature, scriptPublicKey: $publicKey, scriptUrl: $scriptUrl}' > temp_config.json && mv temp_config.json $CONFIG
cat $CONFIG | jq --arg scriptUrl "./FloatplaneScript.js" '. + {scriptUrl: $scriptUrl}' > temp_config.json && mv temp_config.json ./build/$CONFIG

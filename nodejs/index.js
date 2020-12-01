const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const axios = require("axios");
const qs = require("querystring");
const jks = require('jks-js');

const CONFIGURATION = {
  consumerKey: '3MVG9GXbtnGKjXe4PAS7kcT36lyzkxtw1uXNW12J1oKCZ.wYWuxeYVWAv5VglVJ1A6KuA7PGrmlwCgPv98vI2',
  username: 'vinn@tdc.dk.erhverv.businesspf',

  keystoreName: 'selfsignedcertificate15june2019',
  keystorePassword: '123456',
  keystorePath: path.resolve('00D1q0000008hCQ.jks')
};

// Read the PRIVATE_KEY from the JKS
const keystore = jks.toPem(
    fs.readFileSync(CONFIGURATION.keystorePath),
    CONFIGURATION.keystorePassword
);


if (!keystore.hasOwnProperty(CONFIGURATION.keystoreName)) {
    throw new Error(`Unable to find the keystore from the JKS by the name "${CONFIGURATION.keystoreName}". Available keystores: ${Object.keys(keystore).map(x => `"${x}"`).join(', ')}`);
}

const { [CONFIGURATION.keystoreName]: { key: privateKey } } = keystore;

// Create utility function to create a "uri friendly" base64 which salesforce understand
function makeUriFriendlyBase64(base64) {
  return base64.replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
};

function createToken() {
  const jwtHeader = {
    alg: "RS256",
  };

  const jwtClaims = {
    iss: CONFIGURATION.consumerKey,
    sub: CONFIGURATION.username,
    aud: "https://test.salesforce.com",
    exp: (new Date().getTime() + 1000 * 60 * 60) / 1000
  }


  let token = '';
  token += makeUriFriendlyBase64(Buffer.from(JSON.stringify(jwtHeader)).toString('base64'));
  token += '.'
  token += makeUriFriendlyBase64(Buffer.from(JSON.stringify(jwtClaims)).toString('base64'));

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(token);

  token += '.';
  token += makeUriFriendlyBase64(signer.sign(privateKey, 'base64'));

  return token;
}

const token = createToken();

(async function () {
  try {
    const payload = qs.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    });

    const response = await axios.post("https://test.salesforce.com/services/oauth2/token", payload, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    console.log("SUCCESS - Here is the data");
    console.log(JSON.stringify(response.data, null, 2))
  } catch (error) {
    if (error.response) {
      console.log("Status", error.response.status);
      console.log("Body", JSON.stringify(error.response.data, null, 2));
      console.log("Status", JSON.stringify(error.response.headers, null, 2));
      console.log("Config", JSON.stringify(error.response.config, null, 2));
    } else {
      console.log(error);
    }
  }
})();

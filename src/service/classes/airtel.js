import axios from 'axios';
import * as constants from 'constants';
import * as crypto from 'crypto';
import { parserXMLToJson } from '../../util';

export class Airtel {
  constructor(options, environment) {
    this.BASE_DOMAIN = 'https://run.mocky.io/';
    //this.AUTH_URL = 'ipg/v2/vodafoneGHA/getSession/';
    this.TRANSACTION_ROUTES = {
      b2c: 'v3/37eebb9a-9858-428a-9d77-a054890a381f',
      c2b: 'v3/172be3e3-7f2a-46f4-9219-d57acbf6702e',
      //ddc: 'ipg/v2/vodafoneGHA/directDebitCreation/',
      //ddp: 'ipg/v2/vodafoneGHA/directDebitPayment/',
      //query: 'ipg/v2/vodafoneGHA/queryTransactionStatus/',
      //rt: 'ipg/v2/vodafoneGHA/reversal/'
    };
    this.B2C_PARAMS = {
      PAYID: 12,
      PAYID1: 12
    };
    this.baseURL;
    this.options;

    if (environment === 'production') {
      this.baseURL = `${this.BASE_DOMAIN}`;
      //this.baseURL = `${this.BASE_DOMAIN}openapi/`;
    } else {
      this.baseURL = `${this.BASE_DOMAIN}`;
      // this.baseURL = `${this.BASE_DOMAIN}sandbox/`;
    }
    this.options = options;
  }

  async c2b(data, sessionID) {
    const request = `<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:v1="http://xmlns.tigo.com/MFS/PurchaseInitiateRequest/V1"
    xmlns:v3="http://xmlns.tigo.com/RequestHeader/V3"
    xmlns:v2="http://xmlns.tigo.com/ParameterType/V2">
      <soapenv:Header xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
          <cor:debugFlag xmlns:cor="http://soa.mic.co.af/coredata_1">true</cor:debugFlag>
          <wsse:Security>
              <wsse:UsernameToken>
                  <wsse:Username>${this.options.api_username}</wsse:Username>
                  <wsse:Password>${this.options.api_password}</wsse:Password>
              </wsse:UsernameToken>
          </wsse:Security>
      </soapenv:Header>
      <soapenv:Body>
          <v1:PurchaseInitiateRequest>
              <v3:RequestHeader>
                  <v3:GeneralConsumerInformation>
                      <v3:consumerID>TIGO</v3:consumerID>
                      <!--Optional:-->
                      <v3:transactionID>2435399942588</v3:transactionID>
                      <v3:country>GHA</v3:country>
                      <v3:correlationID>3552990003</v3:correlationID>
                  </v3:GeneralConsumerInformation>
              </v3:RequestHeader>
              <v1:requestBody>
                  <v1:customerAccount>
                      <!--You have a CHOICE of the next 2 items at this level-->
                      <v1:msisdn>233561234567</v1:msisdn>
                  </v1:customerAccount>
                  <v1:initiatorAccount>
                      <!--You have a CHOICE of the next 2 items at this level-->
                      <v1:msisdn>233276781234</v1:msisdn>
                  </v1:initiatorAccount>
                  <v1:paymentReference>7112556943392279</v1:paymentReference>
                  <!--Optional:-->
                  <v1:externalCategory>tigo_portal</v1:externalCategory>
                  <!--Optional:-->
                  <v1:externalChannel>hybrid</v1:externalChannel>
                  <!--Optional:-->
                  <v1:webUser>thstest</v1:webUser>
                  <!--Optional:-->
                  <v1:webPassword>Passw@1</v1:webPassword>
                  <!--Optional:-->
                  <v1:merchantName>ebay34</v1:merchantName>
                  <!--Optional:-->
                  <v1:merchantMsisdn>233123456963</v1:merchantMsisdn>
                  <!--Optional:-->
                  <v1:itemName>TV34</v1:itemName>
                  <v1:amount>1</v1:amount>
                  <!--Optional:-->
                  <v1:minutesToExpire>10</v1:minutesToExpire>
                  <v1:notificationChannel>1</v1:notificationChannel>
                  <v1:AuthorizationCode>dGVzdF9td19vc2In6dGlnbzEyMzQ=</v1:AuthorizationCode>
              </v1:requestBody>
          </v1:PurchaseInitiateRequest>
      </soapenv:Body>
  </soapenv:Envelope>`;
    // console.log('\n\n req to c2b : ', request);

    const response = await axios({
      method: 'post',
      url: this.baseURL + this.TRANSACTION_ROUTES.c2b,
      params: request,
      headers: {
        //Origin: '*',
        "Content-Type": "application/xml",
        SOAPAction: "/Services/PurchaseInitiate", //Update this value after get access.
      }
    });
    return await parserXMLToJson(response.data);
  }

  async b2c(data, sessionID) {
    const request = `<COMMAND>
    <APIUSERNAME>${this.options.api_username}</APIUSERNAME>
    <APIPASSWORD>${this.options.api_password}</APIPASSWORD>
    <MSISDN>${data.input_SourceWalletMSISDN}</MSISDN>
    <MSISDN2>${data.input_TargetWalletMSISDN}</MSISDN2>
    <PAYID>${this.B2C_PARAMS.PAYID}</PAYID>
    <PAYID1>${this.B2C_PARAMS.PAYID1}</PAYID1>
    <AMOUNT>${data.input_Amount}</AMOUNT>
    <REFERENCE_NO>${data.input_ThirdPartyConversationID}</REFERENCE_NO>
    <PIN></PIN>
    <TYPE>GENREQ</TYPE>
    <IS_MIDDLEWARE>Y</IS_MIDDLEWARE>
    <EXTTRID></EXTTRID>
</COMMAND>`;
    // console.log('\n\n req to b2c : ', request);

    const response = await axios({
      method: 'post',
      url: this.baseURL + this.TRANSACTION_ROUTES.b2c,
      params: request,
      headers: {
        Accept: 'text/xml',
        Origin: '*'
      }
    });
    return await parserXMLToJson(response.data);
  }


}


/**
 * Write a description of class JwtAuthenticationWithSalesforce here.
 *
 * @author (Vinay Tej)
 * @version (26/11/2020)
 */
import org.apache.commons.codec.binary.Base64;
import java.io.*; 
import java.security.*; 
import java.text.MessageFormat;  


public class JwtAuthenticationWithSalesforce
{
    
    public static void main(String[] args) {

    String header = "{\"alg\":\"RS256\"}";
    //String claimTemplate = "'{'\"iss\": \"{0}\", \"sub\": \"{1}\", \"aud\": \"{2}\", \"exp\": \"{3}\", \"jti\": \"{4}\"'}'";
    String claimTemplate = "'{'\"iss\": \"{0}\", \"sub\": \"{1}\", \"aud\": \"{2}\", \"exp\": \"{3}\"'}'";

    try {
        
      StringBuffer token = new StringBuffer();

      //Encode the JWT Header and add it to our string to sign
      token.append(Base64.encodeBase64URLSafeString(header.getBytes("UTF-8")));

      //Separate with a period
      token.append(".");

      //Create the JWT Claims Object
      String[] claimArray = new String[4];
      claimArray[0] = "3MVG9GXbtnGKjXe4PAS7kcT36lyzkxtw1uXNW12J1oKCZ.wYWuxeYVWAv5VglVJ1A6KuA7PGrmlwCgPv98vI2";// Consumer key from Connected app
      claimArray[1] = "vinn@tdc.dk.erhverv.businesspf";
      claimArray[2] = "https://test.salesforce.com";
      claimArray[3] = Long.toString( ( System.currentTimeMillis()/1000 ) + 300);
      //claimArray[4]= "";
      MessageFormat claims;
      claims = new MessageFormat(claimTemplate);
      String payload = claims.format(claimArray);

      //Add the encoded claims object
      token.append(Base64.encodeBase64URLSafeString(payload.getBytes("UTF-8")));

      //Load the private key from a keystore
      KeyStore keystore = KeyStore.getInstance("JKS");
      //location of java key store containing all the certificates in Salesforce and password is the password set while exporting the certificates to key store
      keystore.load(new FileInputStream("C:/Users/m85160/Downloads/00D1q0000008hCQ (1).jks"), "123456".toCharArray());
      //get the private key for the specific certificate and password is same as above.
      PrivateKey privateKey = (PrivateKey) keystore.getKey("SelfSignedCertificate15June2019", "123456".toCharArray());

      //Sign the JWT Header + "." + JWT Claims Object
      Signature signature = Signature.getInstance("SHA256withRSA");
      signature.initSign(privateKey);
      signature.update(token.toString().getBytes("UTF-8"));
      String signedPayload = Base64.encodeBase64URLSafeString(signature.sign());

      //Separate with a period
      token.append(".");

      //Add the encoded signature
      token.append(signedPayload);

      System.out.println(token.toString());

    } catch (Exception e) {
        e.printStackTrace();
    }
  }
    
    
    
}

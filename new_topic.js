require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

async function main() {

    // Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
    const operatorId = process.env.MY_ACCOUNT_ID;
    const operatorKey = process.env.MY_PRIVATE_KEY;

  // If we weren't able to grab it, we should throw a new error
  if (operatorId == null ||
      operatorKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

// Set the operator account ID and operator private key
client.setOperator(operatorId, operatorKey);

    //Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);
    
    //Grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);
    
    // Wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    //Create the query
    new TopicMessageQuery().setTopicId(topicId).subscribe(client, null, (message) => {
        let messageAsString = Buffer.from(message.contents, "utf8").toString();
        console.log(`${message.consensusTimestamp.toDate()} Received: ${messageAsString}`);
    });
    
    // Send one message
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: "Hello, HCS!",
    }).execute(client);
    const getReceipt = await sendResponse.getReceipt(client);
    
    //Get the status of the transaction
    const transactionStatus = getReceipt.status
    console.log("The message transaction status" + transactionStatus)
}
main();
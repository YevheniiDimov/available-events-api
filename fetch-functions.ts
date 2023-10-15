import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";


export async function fetchAvailableEventsList(awsClient: S3Client) {
    try {
    const command = new GetObjectCommand({
        Bucket: "nftickets-v5",
        Key: "events.json",
    });

    const response = await awsClient.send(command);
    const str = await response.Body?.transformToString();
  
    return str ? JSON.parse(str) : "Error fetching events";
    } catch (error) {
        console.error("Error fetching metadata:", error);
    }
}

export async function addAvailableEvent(awsClient: S3Client, eventPublicKey: string) {
    const jsonObj = await fetchAvailableEventsList(awsClient);
    jsonObj.eventPublicKeys.push(eventPublicKey);

    const file = Buffer.from(JSON.stringify(jsonObj), 'utf-8');
    const command = new PutObjectCommand({
        Bucket: 'nftickets-v5',
        Key: "events.json",
        Body: file,
    });
    
    await awsClient.send(command);
}
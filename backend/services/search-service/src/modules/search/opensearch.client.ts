import { Injectable } from "@nestjs/common";
import { Client } from "@opensearch-project/opensearch";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AwsSigv4Signer } = require("@opensearch-project/opensearch/aws-v3");

@Injectable()
export class OpenSearchClient {
  readonly client: Client;

  constructor() {
    const region = process.env.AWS_REGION ?? "us-east-2";

    this.client = new Client({
      ...AwsSigv4Signer({
        region,
        service: "es",
        getCredentials: () => Promise.resolve({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }),
      }),
      node: process.env.OPENSEARCH_ENDPOINT!,
    });
  }
}
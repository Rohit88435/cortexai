import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// function for get file from s3  with the help of @aws-sdk/s3-request-presigner" this npm package

export const getFromS3 = async (filname, expireIn = 600) => {
  return await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filname,
    }),
    { expiresIn: expireIn },
  );
};

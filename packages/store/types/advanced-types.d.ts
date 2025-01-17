import * as minioVendor from "minio";
import * as postgresVendor from "postgres";
import { PendingQuery } from "postgres";

export type Postgres = postgresVendor.Sql<{}> & {
  connectionOptions?: postgresVendor.Options & { createIfNotExists?: true };
};

export type QueryPartArg =
  | string
  | boolean
  | number
  | null
  | undefined
  | Date
  | QueryPart
  | QueryPartArg[];

export interface QueryPart<T = any> {
  get strings(): string[];
  get values(): QueryPartArg[];

  append(query: QueryPart): QueryPart<T>;
  exec(sql: Postgres): PendingQuery<T>;
}

export type MinioClient = minioVendor.Client;

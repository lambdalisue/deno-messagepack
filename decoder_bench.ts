import { decode, DecodeStream } from "./decoder.ts";
import {
  decode as msgpack_deno_decode,
  decodeStream as msgpack_deno_decodeStream,
} from "https://deno.land/x/msgpack@v1.4/mod.ts";

const testcases = [
  new Uint8Array([
    163,
    102,
    111,
    111,
  ]),
  new Uint8Array([
    100,
  ]),
  new Uint8Array([
    150,
    161,
    97,
    0,
    161,
    98,
    1,
    161,
    99,
    2,
  ]),
  new Uint8Array([
    222,
    0,
    2,
    163,
    102,
    111,
    111,
    163,
    98,
    97,
    114,
    163,
    98,
    97,
    122,
    163,
    113,
    117,
    120,
  ]),
];

Deno.bench("decode", { group: "single", baseline: true }, () => {
  for (const testcase of testcases) {
    decode(testcase);
  }
});

Deno.bench("msgpack-deno/decode", { group: "single" }, () => {
  for (const testcase of testcases) {
    msgpack_deno_decode(testcase);
  }
});

Deno.bench("DecodeStream", { group: "stream", baseline: true }, async () => {
  const stream = new ReadableStream({
    start(controller) {
      for (const testcase of testcases) {
        controller.enqueue(testcase);
      }
      controller.close();
    },
  });
  const messages = stream.pipeThrough(new DecodeStream());
  for await (const _ of messages) {
    // noop
  }
});

Deno.bench("msgpack-deno/decodeStream", { group: "stream" }, async () => {
  const stream = new ReadableStream({
    start(controller) {
      for (const testcase of testcases) {
        controller.enqueue(testcase);
      }
      controller.close();
    },
  });
  const s = msgpack_deno_decodeStream(stream);
  for await (const _ of s) {
    // noop
  }
});

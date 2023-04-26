import {
  encode as msgpack_deno_encode,
} from "https://deno.land/x/msgpack@v1.4/mod.ts";
import { encode } from "./encoder.ts";

const testcases = [
  "foo",
  100,
  ["a", 0, "b", 1, "c", 2],
  { foo: "bar", baz: "qux" },
  new Set(["a", 0, "b", 1, "c", 2]),
  new Map(Object.entries({ foo: "bar", baz: "qux" })),
];

Deno.bench("encode", { group: "single", baseline: true }, () => {
  for (const testcase of testcases) {
    encode(testcase);
  }
});

Deno.bench("msgpack-deno/encode", { group: "single" }, () => {
  for (const testcase of testcases) {
    msgpack_deno_encode(testcase);
  }
});

import { decode, DecodeStream } from "./decoder.ts";
import { assertSnapshot } from "@std/testing/snapshot";

const testcases = {
  string: new Uint8Array([
    163,
    102,
    111,
    111,
  ]),
  number: new Uint8Array([
    100,
  ]),
  array: new Uint8Array([
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
  object: new Uint8Array([
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
};

Deno.test("decode", async (t) => {
  for (const [key, value] of Object.entries(testcases)) {
    await t.step(key, async () => {
      const result = decode(value);
      await assertSnapshot(t, result);
    });
  }
});

Deno.test("DecodeStream", async (t) => {
  await t.step("complete", async () => {
    const stream = new ReadableStream({
      start(controller) {
        for (const testcase of Object.values(testcases)) {
          controller.enqueue(testcase);
        }
        controller.close();
      },
    });
    const messages = stream.pipeThrough(new DecodeStream());
    for await (const message of messages) {
      await assertSnapshot(t, message);
    }
  });

  await t.step("incomplete", async () => {
    const stream = new ReadableStream({
      start(controller) {
        for (const testcase of Object.values(testcases)) {
          const head = testcase.slice(0, 4);
          const tail = testcase.slice(4);
          controller.enqueue(head);
          controller.enqueue(tail);
        }
        controller.close();
      },
    });
    const messages = stream.pipeThrough(new DecodeStream());
    for await (const message of messages) {
      await assertSnapshot(t, message);
    }
  });
});

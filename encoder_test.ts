import { encode, EncodeStream } from "./encoder.ts";
import { assertSnapshot } from "@std/testing/snapshot";

const testcases = {
  string: "foo",
  number: 100,
  array: ["a", 0, "b", 1, "c", 2],
  object: { foo: "bar", baz: "qux" },
};

Deno.test("encode", async (t) => {
  for (const [key, value] of Object.entries(testcases)) {
    await t.step(key, async () => {
      const result = encode(value);
      await assertSnapshot(t, result);
    });
  }
});

Deno.test("EncodeStream", async (t) => {
  const stream = new ReadableStream({
    start(controller) {
      for (const testcase of Object.values(testcases)) {
        controller.enqueue(testcase);
      }
      controller.close();
    },
  });
  const chunks = stream.pipeThrough(new EncodeStream());
  for await (const chunk of chunks) {
    await assertSnapshot(t, chunk);
  }
});

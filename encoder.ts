import { Packr } from "msgpackr";

const packr = new Packr({
  useRecords: false,
  sequential: true,
});

/** Encode `value` into a single MessagePack-encoded object and returns `Uint8Array`. */
export function encode<T extends unknown>(value: T): Uint8Array {
  return packr.pack(value);
}

/** Transform a stream into a stream where each chunk is encoded into a single MessagePack-encoded object.
 *
 * ```ts
 * import { EncodeStream } from "./encoder.ts";
 *
 * const stream = new ReadableStream({
 *   start(controller) {
 *     controller.enqueue({ foo: "bar" });
 *     controller.enqueue({ qux: "quux" });
 *     controller.close();
 *   },
 * });
 * const messages = stream.pipeThrough(new EncodeStream());
 * ```
 */
export class EncodeStream<T extends unknown>
  extends TransformStream<T, Uint8Array> {
  constructor() {
    super({
      transform: (chunk, controller) => {
        controller.enqueue(encode<T>(chunk));
      },
    });
  }
}

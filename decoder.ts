import { Unpackr } from "msgpackr";
import { concat } from "@std/bytes";
import { as, is } from "@core/unknownutil";

const isUnpackrError = is.ObjectOf({
  incomplete: is.Boolean,
  lastPosition: is.Number,
  values: as.Optional(is.ArrayOf(is.Any)),
});

const unpackr = new Unpackr({
  useRecords: false,
  structures: [],
});

/** Decode a single MessagePack-encoded object, and returns the decoded object. */
export function decode<T extends unknown>(chunk: ArrayLike<number>): T {
  return unpackr.unpack(chunk) as T;
}

/** Transform a stream of MessagePack-encoded objects into a stream of decoded objects.
 *
 * It support incomplete chunks of MessagePack-encoded objects.
 */
export class DecodeStream<T extends unknown>
  extends TransformStream<Uint8Array, T> {
  #incompleteBuffer?: Uint8Array;

  constructor() {
    super({
      transform: (chunk, controller) => {
        this.#handle(chunk, controller);
      },
    });
  }

  #handle(chunk: Uint8Array, controller: TransformStreamDefaultController<T>) {
    if (this.#incompleteBuffer) {
      chunk = concat([this.#incompleteBuffer, chunk]);
      this.#incompleteBuffer = undefined;
    }
    let values: T[] = [];
    try {
      values = unpackr.unpackMultiple(chunk) as T[];
    } catch (err) {
      if (isUnpackrError(err) && err.incomplete) {
        this.#incompleteBuffer = chunk.slice(err.lastPosition);
        values = err.values ?? [];
      } else {
        throw err;
      }
    } finally {
      for (const value of values) {
        controller.enqueue(value);
      }
    }
  }
}

export type ActionResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export function successResult(message: string): ActionResult {
  return { ok: true, message };
}

export function errorResult(message: string): ActionResult {
  return { ok: false, message };
}

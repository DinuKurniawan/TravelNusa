import type { ZodError } from "zod";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  data?: Record<string, unknown>;
};

export const initialActionState: ActionState = {
  ok: false,
  message: "",
};

export function validationErrorState(error: ZodError): ActionState {
  return {
    ok: false,
    message: "Periksa kembali data yang diisi.",
    errors: error.flatten().fieldErrors,
  };
}

export function errorState(message: string): ActionState {
  return {
    ok: false,
    message,
  };
}

export function successState(message: string, data?: Record<string, unknown>): ActionState {
  return {
    ok: true,
    message,
    data,
  };
}

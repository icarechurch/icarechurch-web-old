import { supabase } from "./client";

export type FunctionRequest = {
  resource: string;
  operation: string;
  input?: unknown;
};

type FunctionResponse<T> = {
  data: T;
};

export async function invokeFunction<T>(
  functionName: string,
  request: FunctionRequest,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<FunctionResponse<T>>(
    functionName,
    { body: request },
  );

  if (error) {
    throw error;
  }

  if (!data || !("data" in data)) {
    throw new Error("Invalid Edge Function response");
  }

  return data.data;
}

"use client";

import { Form as Primitive } from "@base-ui/react/form";
import { mergeClassName } from "@/lib/utils";

type FormProps<Values extends Record<string, unknown> = Record<string, unknown>> = Primitive.Props<Values>;
function Form<Values extends Record<string, unknown> = Record<string, unknown>>({ className, ...props }: FormProps<Values>) {
  return <Primitive<Values> data-slot="form" className={mergeClassName<Primitive.State>("grid min-w-0 gap-5", className)} {...props} />;
}
export { Form };
export type { FormProps };

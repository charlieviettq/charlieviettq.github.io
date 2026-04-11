import { defaultSchema, type Schema } from "hast-util-sanitize";

/**
 * GitHub default + `aside` for doc callouts; `className` on `div` for nested bodies.
 */
export const blogSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "aside"],
  attributes: {
    ...defaultSchema.attributes,
    aside: ["className", "dataDocTitle"],
    details: ["className", "open", "name"],
    div: [...(defaultSchema.attributes?.div ?? []), "className"],
  },
};

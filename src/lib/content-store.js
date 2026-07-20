import seedContent from "../../content/site-content.json";
import { cloneContent } from "@/lib/content-helpers";

// Sisu elab ühes JSON-failis (content/site-content.json) ja loetakse
// build'i ajal sisse — leht on staatiline visiitkaart, admin-liidest ei ole.
export async function getSiteContent() {
  return cloneContent(seedContent);
}

import { logInfo } from "./logger.mjs";
export async function skillTool({ name }) {
  logInfo(`📚 Load skill: ${name}`);
  return {
    acknowledged: true,
    skill: name,
    message: "Skill loading is handled by the parent instance",
  };
}

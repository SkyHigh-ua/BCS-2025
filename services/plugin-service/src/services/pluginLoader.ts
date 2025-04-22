import { exec } from "child_process";
import { PluginRepository } from "../dal/PluginRepository";
import logger from "../utils/logger";
import path from "path";
import fs from "fs";
import util from "util";

const execPromise = util.promisify(exec);
const pluginRepository = new PluginRepository();

export async function loadPluginService(
  pluginId: string,
  sshKey: string,
  otherParams: any
) {
  const plugin = await pluginRepository.getPluginById(pluginId);
  if (!plugin) {
    throw new Error("Plugin not found");
  }

  const repoLink = plugin.repoLink;
  const pluginDir = path.resolve(
    __dirname,
    "../../plugins",
    `plugin-${pluginId}`
  );

  try {
    // Clone the repository
    if (!fs.existsSync(pluginDir)) {
      await execPromise(`git clone ${repoLink} ${pluginDir}`);
    }

    // Execute the init.sh script
    const initScriptPath = path.join(pluginDir, "init.sh");
    if (!fs.existsSync(initScriptPath)) {
      throw new Error("init.sh script not found in the repository");
    }

    const command = `bash ${initScriptPath} --ssh-key ${sshKey} ${otherParams}`;
    await execPromise(command);

    logger.info(`Plugin ${pluginId} loaded successfully`);
  } catch (error) {
    logger.error(`Error loading plugin ${pluginId}:`, error);
    throw error;
  }
}

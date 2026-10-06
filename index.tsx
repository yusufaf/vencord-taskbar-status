/*
 * TaskbarStatus, a Vencord plugin
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getUserSettingLazy } from "@api/UserSettings";
import definePlugin, { PluginNative } from "@utils/types";
import { UserSettingsProtoStore } from "@webpack/common";

import type { Status } from "./merge";

const Native = VencordNative.pluginHelpers.TaskbarStatus as PluginNative<typeof import("./native")>;
const StatusSettings = getUserSettingLazy<Status>("status", "status")!;

let lastStatus: Status | null = null;

function onSettingsChange() {
    const status = StatusSettings.getSetting();
    if (status === lastStatus) return;
    lastStatus = status;
    Native.update(status);
}

export default definePlugin({
    name: "TaskbarStatus",
    description: "Change your status from the Windows taskbar: buttons in the hover preview and tasks in the right-click jump list",
    tags: ["Utility"],
    authors: [{ name: "yusufaf", id: 0n }],

    async setStatus(status: Status) {
        lastStatus = status;
        await StatusSettings.updateSetting(status);
        Native.update(status);
    },

    async start() {
        lastStatus = StatusSettings.getSetting();
        const pending = await Native.start(lastStatus);
        UserSettingsProtoStore.addChangeListener(onSettingsChange);
        if (pending && pending !== lastStatus) await this.setStatus(pending);
    },

    stop() {
        UserSettingsProtoStore.removeChangeListener(onSettingsChange);
        Native.stop();
    }
});

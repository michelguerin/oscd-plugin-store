<svelte:options tag={null} />

<script lang="ts">
    import PluginStore from "./plugin-store.svelte";
    import { name, version } from "../package.json";

    let isOpen = false;

    export async function run() {
        isOpen = true;
    }
</script>

<PluginStore bind:isOpen />

<input type="hidden" name="package-name" value={name} />
<input type="hidden" name="package-version" value={version} />

<script lang="ts">
import Theme from "./theme/theme.svelte";
import { IconClose } from "./components/icons";
import Textfield from "@smui/textfield";
import { Label } from "@smui/button";
import Switch from "@smui/switch";
import SMUIButton from "@smui/button";
import IconButton from "@smui/icon-button";
import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
import { plugins as externalPlugins } from "../public/plugins.json";
import PluginStoreItem from "./plugin-store-item.svelte";

const isRestricted = !import.meta.env.VITE_EXTERNAL_PLUGINS === true;

export let isOpen: boolean;

// #region Plugin

type PluginKind = "editor" | "menu" | "validator";
const menuPosition = ["top", "middle", "bottom"] as const;
type MenuPosition = (typeof menuPosition)[number];

type Plugin = {
	name: string;
	author?: string;
	src: string;
	icon?: string;
	kind: PluginKind;
	requireDoc?: boolean;
	position?: MenuPosition;
	installed: boolean;
	official?: boolean;
	description?: string;
};

function storedPlugins(): Plugin[] {
	return <Plugin[]>(
		JSON.parse(localStorage.getItem("plugins") ?? "[]", (key, value) => value)
	);
}

let showOnlyInstalled = false;
let searchFilter = "";

function combineAllPlugins(local: Plugin[], external: Plugin[]): Plugin[] {
	const plugins = [...local];

	if (!isRestricted) {
		for (const plugin of external) {
			if (!localPlugins.some((it) => it.name === plugin.name)) {
				plugins.push(plugin);
			}
		}
	}

	plugins.sort((a, b) => {
		if (a.author && b.author && a.author !== b.author) {
			return a.author?.localeCompare(b.author);
		}

		return a.name.localeCompare(b.name);
	});

	return plugins;
}

function filterInstalledPlugins(plugin: Plugin, isChecked: boolean): boolean {
	return !isChecked || localPlugins.includes(plugin);
}

function filterSearchResults(plugin: Plugin, filter: string): boolean {
	const search = filter.toLowerCase();

	const foundName = plugin.name.toLowerCase().includes(search);
	let foundAuthor = false;

	if (plugin.author) {
		foundAuthor = plugin.author.toLowerCase().includes(search);
	}

	return foundName || foundAuthor;
}

// Prevent Plugin Store itself from showing up in search results.
function filterSelf(plugin: Plugin): boolean {
	return plugin.name !== "PluginStore" && plugin.name !== "Plugin Store";
}

let localPlugins = storedPlugins();
$: plugins = combineAllPlugins(localPlugins, externalPlugins as Plugin[]);
$: filteredPlugins = plugins
	.filter((plugin) => filterInstalledPlugins(plugin, showOnlyInstalled))
	.filter((plugin) => filterSearchResults(plugin, searchFilter))
	.filter((plugin) => filterSelf(plugin));

$: editorPlugins = filteredPlugins.filter((it) => it.kind === "editor");
$: menuPlugins = filteredPlugins.filter((it) => it.kind === "menu");
$: validatorPlugins = filteredPlugins.filter((it) => it.kind === "validator");

// #endregion

// #region UI
let pluginStore: Element;

// #endregion
</script>

<Theme>
    <Dialog
        bind:open={isOpen}
        fullscreen
        surface$style="width: 850px; max-width: calc(100vw - 32px);"
        aria-labelledby="plugin-store-title"
        aria-describedby="plugin-store-content"
    >
        <Header>
            <Title id="plugin-store-title">Plugin Store</Title>
            <IconButton class="material-icons" action="close">
                <IconClose />
            </IconButton>
        </Header>
        <Content id="plugin-store-content">
            <plugin-store bind:this={pluginStore}>
                <plugin-store-toolbar>
                    <plugin-store-filters--switch>
                        <Switch
                            bind:checked={showOnlyInstalled}
                            style="margin: 0;"
                        />
                        <Label>Only Installed</Label>  
                    </plugin-store-filters--switch>
                    <Textfield
                        label={"Search"}
                        variant={"outlined"}
                        bind:value={searchFilter}
                    />
                </plugin-store-toolbar>
                <plugin-store-items>
                    <plugin-store-items--category>
                        <strong><div class="mdc-typography--headline6">Editor</div></strong>
                        <hr class="plugin-store-items--divider">
                    </plugin-store-items--category>
                    {#each editorPlugins as plugin, index}
                        <PluginStoreItem 
                         plugin={plugin}
                         index={index}
                         filteredPlugins={filteredPlugins} 
                         storedPlugins={storedPlugins()} 
                         localPlugins={localPlugins} 
                         pluginStore={pluginStore}/> 
                    {/each}
                    {#if editorPlugins.length === 0}
                        <div class="mdc-typography--body2" style="margin-top: 1em;">
                            No plugins found.
                        </div>
                    {/if}
                    <plugin-store-items--category>
                        <strong><div class="mdc-typography--headline6">Menu</div></strong>
                        <hr class="plugin-store-items--divider">
                    </plugin-store-items--category>
                    {#each menuPlugins as plugin, index}
                        <PluginStoreItem 
                         plugin={plugin}
                         index={index}
                         filteredPlugins={filteredPlugins} 
                         storedPlugins={storedPlugins()} 
                         localPlugins={localPlugins} 
                         pluginStore={pluginStore}/> 
                    {/each}
                    {#if menuPlugins.length === 0}
                        <div class="mdc-typography--body2" style="margin-top: 1em;">
                            No plugins found.
                        </div>
                    {/if}
                    <plugin-store-items--category>
                        <strong><div class="mdc-typography--headline6">Validator</div></strong>
                        <hr class="plugin-store-items--divider">
                    </plugin-store-items--category>
                    {#each validatorPlugins as plugin, index}
                        <PluginStoreItem 
                         plugin={plugin}
                         index={index}
                         filteredPlugins={filteredPlugins} 
                         storedPlugins={storedPlugins()} 
                         localPlugins={localPlugins} 
                         pluginStore={pluginStore}/> 
                    {/each}
                    {#if validatorPlugins.length === 0}
                        <div class="mdc-typography--body2" style="margin-top: 1em;">
                            No plugins found.
                        </div>
                    {/if}
                </plugin-store-items>
            </plugin-store>
        </Content>
        <Actions>
            <SMUIButton action="accept">
                <Label>Close</Label>
            </SMUIButton>
        </Actions>
    </Dialog>
</Theme>

<style>
    :root,
    :host {
        --header-height: 128px;
    }
    plugin-store {
        height: calc(100vh - var(--header-height));
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: relative;
    }
    plugin-store-toolbar {
        display: flex;
        justify-content: space-between;
        place-items: center;
        margin-top: 1rem;
        margin-bottom: -1.5em;
    }
    plugin-store-filters--switch {
        display: flex;
        place-items: center;
        gap: 0.8rem;
    }
    plugin-store-items {
        display: flex;
        flex-direction: column;
        padding: 1rem 0;
    }
    plugin-store-items--category {
        margin-top: 2em; 
        margin-bottom: -0.35em;
    }
    .plugin-store-items--divider {
        display: flex;
        width: 100%;
        border: 0;
        height: 1px;
        background: black;
        opacity: 0.1;
    }
</style>

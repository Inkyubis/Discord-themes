# Wayfarer's Codex: Scrying Station

An original fantasy Discord theme that presents the interface as translucent
magical glass floating over a candlelit scholar's desk.

## Install

1. Download `WayfarersCodex-ScryingStation.theme.css`.
2. Place it in your custom client theme folder.
3. Place `WayfarersCodex-UnreadIndicators.plugin.js` in your plugins folder.
4. Return to Discord and enable both add-ons.

The theme loads its original background scene from this repository. An internet
connection is needed for the scene image. The repository also includes:

- `preview-scrying-station.html` - offline visual preview
- `assets/scrying-station.webp` - compact scene image
- `assets/scrying-station-source.png` - full-quality source scene

Client modifications are third-party software. Review the current terms and
security guidance for your chosen client before installing one.

## Customize

The persistent interface surfaces are set to 10% opacity:

```css
--wc-glass-deep: rgba(3, 10, 11, 0.10);
--wc-glass: rgba(7, 19, 20, 0.10);
--wc-glass-soft: rgba(11, 29, 29, 0.10);
--wc-nav-glass: rgba(7, 19, 20, 0.10);
```

`--wc-nav-glass` controls the server channel list, direct-message and Friends
navigation, Friends list, Active Now panel, and server member list. Version
2.0.32 preserves member-list text background images so gradient/role-colored
names do not blank out, and changes unread channels from forced white text to a
semi-transparent row highlight. Version 2.0.31 removes the theme's global Discord text-token overrides, username
speaker shadows, and chat-name styling so member and chat username colors remain
controlled by Discord/server settings.
Version 2.0.30 removes the member-panel username/name/content recovery selectors.
Version 2.0.29 keeps speaking-user name colors under Discord's server/role settings
while preserving the visibility fix. Version 2.0.28 restores
right-side member-list names after Discord's latest member panel layout change.
Version 2.0.27 softens the speaking-user avatar glow by 20%. Version 2.0.26 restores
voice-channel occupant avatars by keeping Discord avatar background images out
of the transparent-pane reset. Version 2.0.25 refreshes the package with the
quieter 1.2.9 unread plugin. Version
2.0.24 adds a Discord-update recovery layer that uses plugin-authored
`data-wc-*` pane markers plus ARIA fallbacks, while keeping persistent panes at
one true 10% layer and restoring the teal voice-speaking glow.

The included unread-indicator plugin preserves teal server dots without using
muted or stale channel state, preventing dots on servers with no current unread
messages while adding a fallback for Discord updates that no longer wake the
read-state listener. Version 1.2.9 adds a single-instance guard, de-duplicates
repeated message events, ignores direct messages entirely, and avoids writing
runtime diagnostics on every message so Discord's own notification audio stays
undisturbed. Version 1.2.8 marks live guild, channel, member, activity, and
voice rows with stable `data-wc-*` attributes.

## Originality

The scene, interface treatment, palette, and terminology were created for this
package. The image uses generic fantasy objects and contains no copied logos,
named settings, recognizable characters, commercial maps, or franchise art.

## Compatibility

Discord regularly changes internal class names. This theme favors Discord color
tokens and partial class selectors to reduce breakage, but future updates may
require selector maintenance.

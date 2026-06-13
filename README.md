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
2.0.13 reduces persistent panes to 10% and restores server unread pills and
mention badges while preserving profile content and controls.

Discord sometimes removes its server unread-marker element even while its
channel store still contains unread messages. The included unread-indicator
plugin restores the teal server dot from that local state.

## Originality

The scene, interface treatment, palette, and terminology were created for this
package. The image uses generic fantasy objects and contains no copied logos,
named settings, recognizable characters, commercial maps, or franchise art.

## Compatibility

Discord regularly changes internal class names. This theme favors Discord color
tokens and partial class selectors to reduce breakage, but future updates may
require selector maintenance.

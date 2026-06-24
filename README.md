# Wayfarer's Codex: Scrying Station

A fantasy Discord theme that turns the app into a translucent scrying desk:
glass-like panels over an original candlelit scholar's table scene.

This project is fantasy-inspired without using licensed settings, characters,
logos, maps, or commercial tabletop game art.

## What's Included

- `WayfarersCodex-ScryingStation.theme.css` - the BetterDiscord theme
- `WayfarersCodex-UnreadIndicators.plugin.js` - companion plugin for unread
  server dots, voice speaking glows, and durable Discord panel markers
- `preview-scrying-station.html` - offline visual preview
- `assets/scrying-station.webp` - optimized background scene
- `assets/scrying-station-source.png` - full-quality source scene

## Current Version

- Theme: `2.0.43`
- Plugin: `1.2.12`

Recent improvements:

- Persistent panels are kept at one light 10% glass layer.
- Unread channels get a teal row glow so they are easier to find.
- Server unread dots are restored without stale false-positive dots.
- Voice users glow when speaking.
- Member and chat name colors stay controlled by Discord/server role settings.
- Right-side member hover paint is removed so the whole panel does not light up.
- Server-rail mention strips are muted so the top and bottom of the left rail
  do not flare brighter than the rest of the theme.
- Channel-list top/bottom overlay bars are hidden so server invite/settings
  controls are not covered by bright panes.
- Video/call wrapper surfaces use transparency where Discord allows it. Black
  pixels inside the actual stream/video cannot be made transparent by CSS.
- The non-prioritized/floating video content is enlarged by about 50% without
  forcing Discord's drag position or screen anchor.

## Install

1. Download `WayfarersCodex-ScryingStation.theme.css`.
2. Put it in your BetterDiscord themes folder.
3. Download `WayfarersCodex-UnreadIndicators.plugin.js`.
4. Put it in your BetterDiscord plugins folder.
5. Reload Discord, then enable both the theme and plugin.

The theme loads its background image from this repository, so Discord needs an
internet connection for the desk scene to appear.

## Customize Transparency

The main glass surfaces are set to 10% opacity:

```css
--wc-glass-deep: rgba(3, 10, 11, 0.10);
--wc-glass: rgba(7, 19, 20, 0.10);
--wc-glass-soft: rgba(11, 29, 29, 0.10);
--wc-nav-glass: rgba(7, 19, 20, 0.10);
```

Increase the last number for darker panels, or decrease it for more of the
desk scene showing through. `--wc-nav-glass` controls the server rail, channel
list, Friends list, Active Now panel, and server member list.

## Troubleshooting

If unread dots, speaking glows, or panel transparency stop working after a
Discord update, restart Discord and make sure the companion plugin is enabled.
Discord changes internal class names often, and the plugin helps the theme find
important panels more reliably.

If the theme still looks stale after updating, remove the old theme/plugin
files and install the current versions again.

## Notes

BetterDiscord and similar client modifications are third-party software. Review
the current terms and security guidance for your chosen client before installing
any add-on.

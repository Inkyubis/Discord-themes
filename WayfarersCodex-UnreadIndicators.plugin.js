/**
 * @name WayfarersCodexUnreadIndicators
 * @author Inkyubis & Byte
 * @version 1.1.1
 * @description Keeps server unread markers visible and restores voice-user speaking glows.
 */

module.exports = class WayfarersCodexUnreadIndicators {
  start() {
    this.readState = BdApi.Webpack.getStore("GuildReadStateStore");
    this.speakingStore = BdApi.Webpack.getStore("SpeakingStore");
    this.scheduleUpdate = () => {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => {
        this.updateMarkers();
        this.updateSpeakingUsers();
      });
    };

    this.observer = new MutationObserver(this.scheduleUpdate);
    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "aria-label", "data-list-item-id"],
      childList: true,
      subtree: true
    });
    this.readState?.addChangeListener(this.scheduleUpdate);
    this.speakingStore?.addChangeListener(this.scheduleUpdate);

    BdApi.DOM.addStyle(
      "WayfarersCodexUnreadIndicators",
      `
        #app-mount nav[aria-label*="Servers"]
          [class*="listItem_"][data-wc-unread="true"] {
          position: relative;
        }

        #app-mount nav[aria-label*="Servers"]
          [class*="listItem_"][data-wc-unread="true"]::before {
          content: "";
          position: absolute;
          z-index: 10;
          top: 50%;
          left: 0;
          width: 4px;
          height: 10px;
          border-radius: 0 4px 4px 0;
          background: var(--wc-teal, #63e6dc) !important;
          box-shadow: 0 0 12px rgba(99, 230, 220, 0.9) !important;
          transform: translateY(-50%);
        }

        #app-mount [data-wc-speaking="true"] {
          background: linear-gradient(
            90deg,
            rgba(99, 230, 220, 0.14),
            rgba(99, 230, 220, 0.03) 70%,
            transparent
          ) !important;
          box-shadow: inset 3px 0 rgba(121, 235, 225, 0.8) !important;
        }

        #app-mount [data-wc-speaking="true"] [class*="avatar"],
        #app-mount [data-wc-speaking="true"] img {
          outline: 2px solid rgba(121, 235, 225, 0.8) !important;
          outline-offset: 2px !important;
          filter:
            brightness(1.13)
            saturate(1.14)
            drop-shadow(0 0 5px rgba(99, 230, 220, 0.8))
            drop-shadow(0 0 11px rgba(99, 230, 220, 0.66)) !important;
        }

        #app-mount [data-wc-speaking="true"] [class*="username"] {
          color: #79ebe1 !important;
          text-shadow: 0 0 8px rgba(99, 230, 220, 0.64) !important;
        }
      `
    );

    this.scheduleUpdate();
  }

  updateMarkers() {
    const treeItems = document.querySelectorAll(
      'nav[aria-label*="Servers"] [data-list-item-id^="guildsnav___"]'
    );

    for (const treeItem of treeItems) {
      const guildId = treeItem.dataset.listItemId?.replace("guildsnav___", "");
      if (!/^\d+$/.test(guildId || "")) continue;

      const unread =
        this.readState?.hasUnread(guildId) ||
        this.readState?.getMentionCount(guildId) > 0;
      const listItem = treeItem.closest('[class*="listItem_"]');

      if (listItem) {
        if (unread) {
          listItem.setAttribute("data-wc-unread", "true");
        } else {
          listItem.removeAttribute("data-wc-unread");
        }
      }
    }
  }

  getVoiceUserRows() {
    const rows = new Set();
    const selectors = [
      '[data-list-item-id*="voice-user" i]',
      '[data-list-item-id*="voiceuser" i]',
      '[data-list-item-id*="voice" i]',
      '[class*="voiceUser" i]'
    ];

    for (const element of document.querySelectorAll(selectors.join(","))) {
      const row =
        element.closest('[class*="voiceUser" i]') ||
        element.closest('[data-list-item-id]') ||
        element;
      rows.add(row);
    }

    return rows;
  }

  getUserId(row) {
    const idSources = [
      row.getAttribute("data-list-item-id"),
      row.id,
      row.getAttribute("aria-label"),
      ...Array.from(row.querySelectorAll("[data-list-item-id]"), (element) =>
        element.getAttribute("data-list-item-id")
      )
    ];

    for (const source of idSources) {
      const userId = source?.match(/\d{16,20}/)?.[0];
      if (userId) return userId;
    }

    return null;
  }

  isSpeaking(row, userId) {
    const nativeMarker = row.matches(
      '[class*="speaking" i], [data-speaking="true"], [aria-label*="speaking" i]'
    ) || row.querySelector(
      '[class*="speaking" i], [data-speaking="true"], [aria-label*="speaking" i]'
    );

    if (nativeMarker) return true;
    if (!userId || typeof this.speakingStore?.isSpeaking !== "function") {
      return false;
    }

    try {
      return Boolean(this.speakingStore.isSpeaking(userId));
    } catch {
      return false;
    }
  }

  updateSpeakingUsers() {
    for (const row of this.getVoiceUserRows()) {
      const userId = this.getUserId(row);
      row.toggleAttribute("data-wc-speaking", this.isSpeaking(row, userId));
    }
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
    this.readState?.removeChangeListener(this.scheduleUpdate);
    this.speakingStore?.removeChangeListener(this.scheduleUpdate);
    BdApi.DOM.removeStyle("WayfarersCodexUnreadIndicators");

    document
      .querySelectorAll('[data-wc-unread="true"], [data-wc-speaking="true"]')
      .forEach((element) => {
        element.removeAttribute("data-wc-unread");
        element.removeAttribute("data-wc-speaking");
      });
  }
};

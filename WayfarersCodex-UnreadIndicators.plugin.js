/**
 * @name WayfarersCodexUnreadIndicators
 * @author Inkyubis & Byte
 * @version 1.2.6
 * @description Keeps server unread markers visible and restores voice-user speaking glows.
 */

module.exports = class WayfarersCodexUnreadIndicators {
  start() {
    try {
      this.initialize();
    } catch (error) {
      this.saveStartupError(error);
    }
  }

  initialize() {
    this.pluginName = "WayfarersCodexUnreadIndicators";
    this.fallbackUnreadChannels = new Map();
    this.fallbackPulseMs = 3500;
    this.dispatchSubscriptions = [];
    this.runtime = {
      startedAt: new Date().toISOString(),
      dispatcherFound: false,
      dispatcherSource: null,
      messageEvents: 0,
      guildNavItems: 0,
      fallbackChannels: 0,
      fallbackPulseMs: this.fallbackPulseMs
    };

    this.guildReadState = this.getStore("GuildReadStateStore");
    this.readState = this.getStore("ReadStateStore") || this.guildReadState;
    this.speakingStore = this.getStore("SpeakingStore");
    this.channelStore = this.getStore("ChannelStore");
    this.guildChannelStore = this.getStore("GuildChannelStore");
    this.mutedStore =
      this.getStore("MutedStore") ||
      this.getStore("UserGuildSettingsStore") ||
      this.getStore("NotificationSettingsStore");
    this.selectedChannelStore = this.getStore("SelectedChannelStore");
    this.selectedGuildStore = this.getStore("SelectedGuildStore");
    this.userStore = this.getStore("UserStore");
    this.dispatcher = this.getDispatcher();
    this.runtime.dispatcherFound = Boolean(this.dispatcher);
    this.runtime.stores = {
      guildReadState: Boolean(this.guildReadState),
      readState: Boolean(this.readState),
      speaking: Boolean(this.speakingStore),
      channel: Boolean(this.channelStore),
      guildChannel: Boolean(this.guildChannelStore),
      muted: Boolean(this.mutedStore),
      selectedChannel: Boolean(this.selectedChannelStore),
      selectedGuild: Boolean(this.selectedGuildStore),
      user: Boolean(this.userStore)
    };

    this.scheduleUpdate = () => {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => {
        this.updateMarkers();
        this.updateSpeakingUsers();
      });
    };

    this.saveRuntime("start-init");

    const observerTarget = document.body || document.documentElement;
    if (observerTarget) {
      this.observer = new MutationObserver(this.scheduleUpdate);
      this.observer.observe(observerTarget, {
        attributes: true,
        attributeFilter: ["class", "aria-label", "data-list-item-id"],
        childList: true,
        subtree: true
      });
    }

    this.readState?.addChangeListener?.(this.scheduleUpdate);
    if (this.guildReadState !== this.readState) {
      this.guildReadState?.addChangeListener?.(this.scheduleUpdate);
    }
    this.speakingStore?.addChangeListener?.(this.scheduleUpdate);

    this.subscribeDispatch("MESSAGE_CREATE", (event) => this.handleMessageCreate(event));
    this.subscribeDispatch("MESSAGE_ACK", (event) => this.handleReadEvent(event));
    this.subscribeDispatch("CHANNEL_ACK", (event) => this.handleReadEvent(event));
    this.subscribeDispatch("CHANNEL_SELECT", (event) => this.handleChannelSelect(event));
    this.subscribeDispatch("GUILD_SELECT", (event) => this.handleGuildSelect(event));

    this.addStyle(
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

    this.saveRuntime("start");
    this.scheduleUpdate();
    this.pollTimer = setInterval(this.scheduleUpdate, 2000);
  }

  saveStartupError(error) {
    this.pluginName ||= "WayfarersCodexUnreadIndicators";
    this.fallbackUnreadChannels ||= new Map();
    this.fallbackPulseMs ||= 3500;
    this.runtime ||= {
      startedAt: new Date().toISOString(),
      dispatcherFound: false,
      messageEvents: 0,
      guildNavItems: 0,
      fallbackChannels: 0,
      fallbackPulseMs: this.fallbackPulseMs
    };

    try {
      BdApi.Data.save(this.pluginName, "runtime", {
        ...this.runtime,
        reason: "startup-error",
        error: String(error?.stack || error?.message || error),
        updatedAt: new Date().toISOString()
      });
    } catch {}
  }

  getStore(name) {
    try {
      return BdApi.Webpack.getStore(name);
    } catch {
      return null;
    }
  }

  getDispatcher() {
    const storeDispatcher = this.getStoreDispatcher();
    if (storeDispatcher) return storeDispatcher;

    const webpack = BdApi.Webpack;

    try {
      const dispatcher = webpack.getByKeys?.("dispatch", "subscribe", "unsubscribe");
      if (this.isDispatcher(dispatcher)) {
        this.runtime.dispatcherSource = "webpack.getByKeys";
        return dispatcher;
      }
    } catch {}

    try {
      const byKeys = webpack.Filters?.byKeys?.("dispatch", "subscribe", "unsubscribe");
      if (byKeys && typeof webpack.getModule === "function") {
        const dispatcher = webpack.getModule(byKeys);
        if (this.isDispatcher(dispatcher)) {
          this.runtime.dispatcherSource = "webpack.getModule";
          return dispatcher;
        }
      }
    } catch {}

    try {
      const dispatcher = webpack.getModule?.(
        (module) =>
          typeof module?.dispatch === "function" &&
          typeof module?.subscribe === "function" &&
          typeof module?.unsubscribe === "function"
      );
      if (this.isDispatcher(dispatcher)) {
        this.runtime.dispatcherSource = "webpack.predicate";
        return dispatcher;
      }
    } catch {
      return null;
    }

    return null;
  }

  getStoreDispatcher() {
    const stores = [
      this.readState,
      this.guildReadState,
      this.speakingStore,
      this.channelStore,
      this.guildChannelStore,
      this.mutedStore,
      this.selectedChannelStore,
      this.selectedGuildStore,
      this.userStore
    ];

    for (const store of stores) {
      const candidates = [
        store?._dispatcher,
        store?.dispatcher,
        store?._dispatcher?._dispatcher
      ];

      for (const candidate of candidates) {
        if (this.isDispatcher(candidate)) {
          this.runtime.dispatcherSource = "store._dispatcher";
          return candidate;
        }
      }
    }

    return null;
  }

  isDispatcher(candidate) {
    return Boolean(
      candidate &&
        typeof candidate.dispatch === "function" &&
        typeof candidate.subscribe === "function" &&
        typeof candidate.unsubscribe === "function"
    );
  }

  subscribeDispatch(type, handler) {
    if (typeof this.dispatcher?.subscribe !== "function") return;

    const wrapped = (event) => {
      try {
        handler(event || {});
      } catch (error) {
        this.saveRuntime(`error:${type}`, { error: String(error?.message || error) });
      }
    };

    this.dispatcher.subscribe(type, wrapped);
    this.dispatchSubscriptions.push([type, wrapped]);
  }

  handleMessageCreate(event) {
    const message = event.message || event;
    const channelId =
      event.channelId || event.channel_id || message.channelId || message.channel_id;
    const guildId =
      event.guildId ||
      event.guild_id ||
      message.guildId ||
      message.guild_id ||
      this.getGuildIdForChannel(channelId);

    if (!guildId || !channelId) return;

    this.runtime.messageEvents += 1;
    this.runtime.lastMessage = {
      hasGuild: true,
      fromSelf: this.isCurrentUser(message.author?.id || message.authorId),
      selectedChannel: this.getSelectedChannelId() === channelId,
      selectedGuild: this.getSelectedGuildId() === guildId
    };

    if (!this.runtime.lastMessage.fromSelf && !this.runtime.lastMessage.selectedChannel) {
      this.fallbackUnreadChannels.set(channelId, {
        guildId,
        expiresAt: Date.now() + this.fallbackPulseMs
      });
    }

    this.saveRuntime("message");
    this.scheduleUpdate();
    setTimeout(this.scheduleUpdate, 600);
  }

  handleReadEvent(event) {
    const channelId = event.channelId || event.channel_id || event.channel?.id;
    if (channelId) this.fallbackUnreadChannels.delete(channelId);

    this.saveRuntime("ack");
    this.scheduleUpdate();
    setTimeout(this.scheduleUpdate, 600);
  }

  handleChannelSelect(event) {
    const channelId = event.channelId || event.channel_id;
    if (channelId) this.fallbackUnreadChannels.delete(channelId);

    const guildId =
      event.guildId || event.guild_id || this.getGuildIdForChannel(channelId);
    if (guildId && !this.hasNativeUnread(guildId)) {
      this.clearFallbackGuild(guildId);
    }

    this.saveRuntime("channel-select");
    this.scheduleUpdate();
  }

  handleGuildSelect(event) {
    const guildId = event.guildId || event.guild_id || this.getSelectedGuildId();
    if (guildId && !this.hasNativeUnread(guildId)) {
      this.clearFallbackGuild(guildId);
    }

    this.saveRuntime("guild-select");
    this.scheduleUpdate();
  }

  updateMarkers() {
    const guildItems = this.getGuildNavItems();
    this.pruneFallbackUnread();
    this.runtime.guildNavItems = guildItems.length;
    this.runtime.fallbackChannels = this.fallbackUnreadChannels.size;
    const unreadGuilds = [];
    const nativeUnreadGuilds = [];
    const fallbackUnreadGuilds = [];
    const nativeUnreadSources = [];

    for (const { guildId, listItem } of guildItems) {
      const nativeSource = this.getNativeUnreadSource(guildId);
      const nativeUnread = Boolean(nativeSource);
      const fallbackUnread = !nativeUnread && this.hasFallbackUnread(guildId);
      const unread = nativeUnread || fallbackUnread;

      if (unread) {
        listItem.setAttribute("data-wc-unread", "true");
        unreadGuilds.push(guildId);
        if (nativeUnread) {
          nativeUnreadGuilds.push(guildId);
          nativeUnreadSources.push(nativeSource);
        }
        if (fallbackUnread) fallbackUnreadGuilds.push(guildId);
      } else {
        listItem.removeAttribute("data-wc-unread");
      }
    }

    this.runtime.unreadGuilds = unreadGuilds.slice(0, 25);
    this.runtime.nativeUnreadGuilds = nativeUnreadGuilds.slice(0, 25);
    this.runtime.fallbackUnreadGuilds = fallbackUnreadGuilds.slice(0, 25);
    this.runtime.nativeUnreadSources = nativeUnreadSources.slice(0, 25);
    this.saveRuntime("update");
  }

  getGuildNavItems() {
    const rows = [];
    const candidates = document.querySelectorAll(
      'nav[aria-label*="Servers"] [data-list-item-id], [class*="guilds_"] [data-list-item-id]'
    );

    for (const element of candidates) {
      const guildId = this.extractId(element.dataset.listItemId);
      if (!guildId) continue;

      const listItem = element.closest('[class*="listItem_"]') || element;
      rows.push({ guildId, listItem });
    }

    return rows;
  }

  extractId(value) {
    return String(value || "").match(/\d{16,20}/)?.[0] || null;
  }

  hasNativeUnread(guildId) {
    return Boolean(this.getNativeUnreadSource(guildId));
  }

  getNativeUnreadSource(guildId) {
    try {
      for (const channelId of this.getGuildChannelIds(guildId)) {
        const unreadSource = this.storeUnreadSource(this.readState, channelId);
        if (unreadSource) {
          const channel = this.getChannel(channelId);
          return {
            guildId,
            channelId,
            channelName: channel?.name || null,
            channelType: channel?.type ?? null,
            ...unreadSource
          };
        }
      }
    } catch {}

    return null;
  }

  storeHasUnread(store, id) {
    return Boolean(this.storeUnreadSource(store, id));
  }

  storeUnreadSource(store, id) {
    if (!store || !id) return false;

    try {
      const mentionCount = store.getMentionCount?.(id);
      if (mentionCount > 0) return { method: "getMentionCount", value: mentionCount };

      const unreadCount = store.getUnreadCount?.(id);
      if (unreadCount > 0) return { method: "getUnreadCount", value: unreadCount };

      const hasUnread = store.hasUnread?.(id);
      if (hasUnread) return { method: "hasUnread", value: true };

      const hasUnreadCount = store.hasUnreadCount?.(id);
      if (hasUnreadCount) return { method: "hasUnreadCount", value: true };
    } catch {}

    return null;
  }

  getGuildChannelIds(guildId) {
    const ids = new Set();
    const harvest = (value, depth = 0) => {
      if (depth > 5 || value == null || ids.size > 500) return;

      if (typeof value === "string") {
        if (this.isUnreadEligibleChannel(value, guildId)) ids.add(value);
        return;
      }

      if (Array.isArray(value)) {
        for (const item of value) harvest(item, depth + 1);
        return;
      }

      if (typeof value !== "object") return;

      const directId = value.id || value.channelId || value.channel_id;
      const directGuild = value.guild_id || value.guildId;
      if (directId && directId !== guildId && (!directGuild || directGuild === guildId)) {
        if (this.isUnreadEligibleChannel(directId, guildId)) ids.add(directId);
      }

      if (value.channel) harvest(value.channel, depth + 1);
      if (value.record) harvest(value.record, depth + 1);
      if (value.channels) harvest(value.channels, depth + 1);
      if (value.selectable) harvest(value.selectable, depth + 1);
      if (value.SELECTABLE) harvest(value.SELECTABLE, depth + 1);

      for (const key of Object.keys(value).slice(0, 80)) {
        if (/channel/i.test(key) || /^\d{16,20}$/.test(key)) {
          harvest(value[key], depth + 1);
        }
      }
    };

    const sources = [
      () => this.guildChannelStore?.getChannels?.(guildId),
      () => this.guildChannelStore?.getChannelsForGuild?.(guildId),
      () => this.guildChannelStore?.getMutableGuildChannelsForGuild?.(guildId),
      () => this.guildChannelStore?.getSelectableChannelIds?.(guildId),
      () => this.guildChannelStore?.getSelectableChannelIdsForGuild?.(guildId)
    ];

    for (const getSource of sources) {
      try {
        harvest(getSource());
      } catch {}
    }

    return ids;
  }

  isUnreadEligibleChannel(channelId, guildId) {
    if (!channelId || channelId === guildId) return false;

    try {
      const channel = this.channelStore?.getChannel?.(channelId);
      if (!channel) return false;
      const channelGuildId = channel.guild_id || channel.guildId;
      if (channelGuildId !== guildId) return false;
      if (this.isMuted(guildId, channelId, channel.parent_id || channel.parentId)) {
        return false;
      }

      const textLikeTypes = new Set([0, 5, 10, 11, 12, 15, 16]);
      return channel.type == null || textLikeTypes.has(channel.type);
    } catch {
      return false;
    }
  }

  isMuted(guildId, channelId, parentId) {
    const store = this.mutedStore;
    if (!store) return false;

    const calls = [
      () => store.isMuted?.(guildId),
      () => store.isChannelMuted?.(guildId, channelId),
      () => parentId && store.isChannelMuted?.(guildId, parentId),
      () => store.isChannelMuted?.(channelId),
      () => parentId && store.isChannelMuted?.(parentId),
      () => store.isGuildOrCategoryOrChannelMuted?.(guildId, channelId),
      () => parentId && store.isGuildOrCategoryOrChannelMuted?.(guildId, parentId),
      () => store.isMuted?.(channelId),
      () => parentId && store.isMuted?.(parentId)
    ];

    for (const call of calls) {
      try {
        if (call()) return true;
      } catch {}
    }

    try {
      const mutedChannels = store.getMutedChannels?.(guildId);
      if (Array.isArray(mutedChannels)) {
        return mutedChannels.includes(channelId) || mutedChannels.includes(parentId);
      }

      if (mutedChannels && typeof mutedChannels === "object") {
        return Boolean(mutedChannels[channelId] || mutedChannels[parentId]);
      }
    } catch {}

    return false;
  }

  getChannel(channelId) {
    try {
      return this.channelStore?.getChannel?.(channelId) || null;
    } catch {
      return null;
    }
  }

  hasFallbackUnread(guildId) {
    for (const value of this.fallbackUnreadChannels.values()) {
      const fallbackGuildId =
        typeof value === "string" ? value : value?.guildId;
      if (fallbackGuildId === guildId) return true;
    }

    return false;
  }

  clearFallbackGuild(guildId) {
    for (const [channelId, value] of this.fallbackUnreadChannels.entries()) {
      const fallbackGuildId =
        typeof value === "string" ? value : value?.guildId;
      if (fallbackGuildId === guildId) this.fallbackUnreadChannels.delete(channelId);
    }
  }

  pruneFallbackUnread() {
    const now = Date.now();
    for (const [channelId, value] of this.fallbackUnreadChannels.entries()) {
      if (typeof value === "string" || !value?.expiresAt || value.expiresAt <= now) {
        this.fallbackUnreadChannels.delete(channelId);
      }
    }
  }

  getGuildIdForChannel(channelId) {
    if (!channelId) return null;

    try {
      const channel = this.channelStore?.getChannel?.(channelId);
      return channel?.guild_id || channel?.guildId || null;
    } catch {
      return null;
    }
  }

  getSelectedChannelId() {
    try {
      return this.selectedChannelStore?.getChannelId?.() || null;
    } catch {
      return null;
    }
  }

  getSelectedGuildId() {
    try {
      return this.selectedGuildStore?.getGuildId?.() || null;
    } catch {
      return null;
    }
  }

  isCurrentUser(userId) {
    if (!userId) return false;

    try {
      return this.userStore?.getCurrentUser?.()?.id === userId;
    } catch {
      return false;
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
      const userId = this.extractId(source);
      if (userId) return userId;
    }

    return null;
  }

  isSpeaking(row, userId) {
    const nativeMarker =
      row.matches(
        '[class*="speaking" i], [data-speaking="true"], [aria-label*="speaking" i]'
      ) ||
      row.querySelector(
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

  addStyle(css) {
    try {
      if (typeof BdApi.DOM?.addStyle === "function") {
        BdApi.DOM.addStyle(this.pluginName, css);
        return;
      }

      if (typeof BdApi.injectCSS === "function") {
        BdApi.injectCSS(this.pluginName, css);
        return;
      }

      const style = document.createElement("style");
      style.id = this.pluginName;
      style.textContent = css;
      document.head.appendChild(style);
    } catch (error) {
      this.saveRuntime("error:style", { error: String(error?.message || error) });
    }
  }

  removeStyle() {
    try {
      if (typeof BdApi.DOM?.removeStyle === "function") {
        BdApi.DOM.removeStyle(this.pluginName);
        return;
      }

      if (typeof BdApi.clearCSS === "function") {
        BdApi.clearCSS(this.pluginName);
        return;
      }

      document.getElementById(this.pluginName)?.remove();
    } catch {}
  }

  saveRuntime(reason, extra = {}) {
    if (reason === "update" && Date.now() - (this.lastRuntimeSave || 0) < 5000) {
      return;
    }

    this.lastRuntimeSave = Date.now();

    try {
      BdApi.Data.save(this.pluginName, "runtime", {
        ...this.runtime,
        ...extra,
        reason,
        updatedAt: new Date().toISOString(),
        fallbackChannels: this.fallbackUnreadChannels.size
      });
    } catch {}
  }

  stop() {
    cancelAnimationFrame(this.frame);
    clearInterval(this.pollTimer);
    this.observer?.disconnect();
    this.readState?.removeChangeListener?.(this.scheduleUpdate);
    if (this.guildReadState !== this.readState) {
      this.guildReadState?.removeChangeListener?.(this.scheduleUpdate);
    }
    this.speakingStore?.removeChangeListener?.(this.scheduleUpdate);

    for (const [type, handler] of this.dispatchSubscriptions) {
      try {
        this.dispatcher?.unsubscribe?.(type, handler);
      } catch {}
    }

    this.removeStyle();

    document
      .querySelectorAll('[data-wc-unread="true"], [data-wc-speaking="true"]')
      .forEach((element) => {
        element.removeAttribute("data-wc-unread");
        element.removeAttribute("data-wc-speaking");
      });
  }
};

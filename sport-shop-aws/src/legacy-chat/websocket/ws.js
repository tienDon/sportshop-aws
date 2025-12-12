// src/legacy-chat/websocket/ws.js
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// ⭐ Dùng đúng endpoint WS của BE (giống FE cũ, KHÔNG /api phía sau)
const WS_URL =
  "https://api.donvt.me/api/ws/chat";

class WebSocketClient {
  stomp = null;
  connected = false;
  connecting = false;
  subscriptions = {};

  connect(onConnected, onError) {
    // Nếu đã connected rồi thì gọi lại onConnected luôn (tránh connect lặp)
    if (this.connected || this.connecting) {
      if (this.connected && onConnected) onConnected();
      return;
    }

    this.connecting = true;

    const token = sessionStorage.getItem("token") || null;

    const socket = new SockJS(WS_URL);
    this.stomp = Stomp.over(socket);
    this.stomp.debug = () => {};

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.stomp.connect(
      headers,
      () => {
        this.connected = true;
        this.connecting = false;
        console.log("[WS] Connected");
        if (onConnected) onConnected();
      },
      (err) => {
        console.error("[WS] Error:", err);
        this.connected = false;
        this.connecting = false;
        if (onError) onError(err);

        // Thử reconnect sau 3s
        setTimeout(() => this.connect(onConnected, onError), 3000);
      }
    );
  }

  unsubscribeAll() {
    Object.values(this.subscriptions).forEach((sub) => {
      try {
        sub.unsubscribe();
      } catch (_) {}
    });
    this.subscriptions = {};
  }

  subscribeRoom(roomId, callback) {
    if (!this.connected || !this.stomp) {
      console.warn("[WS] subscribeRoom khi chưa connected");
      return;
    }

    const path = `/topic/room/${roomId}`;

    if (this.subscriptions[path]) {
      return this.subscriptions[path];
    }

    const sub = this.stomp.subscribe(path, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        callback(body);
      } catch (e) {
        console.error("[WS] parse error", e);
      }
    });

    this.subscriptions[path] = sub;
    return sub;
  }

  subscribeNewRoom(callback) {
    const path = `/topic/admin/new-room`;

    if (!this.connected || !this.stomp) {
      const interval = setInterval(() => {
        if (this.connected && this.stomp) {
          clearInterval(interval);
          this.subscribeNewRoom(callback);
        }
      }, 200);
      return;
    }

    if (this.subscriptions[path]) {
      return this.subscriptions[path];
    }

    const sub = this.stomp.subscribe(path, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        callback(body);
      } catch (e) {
        console.error("[WS] parse error", e);
      }
    });

    this.subscriptions[path] = sub;
    return sub;
  }

  // Gửi message: nhận string hoặc object { content, fileUrl, contentType }
  sendMessage(roomId, payload) {
    if (!this.connected || !this.stomp) {
      console.warn("[WS] sendMessage khi chưa connected");
      return;
    }

    let body;
    if (typeof payload === "string") {
      body = {
        content: payload,
        fileUrl: null,
        contentType: "TEXT",
      };
    } else {
      body = payload;
    }

    this.stomp.send(`/app/chat.send/${roomId}`, {}, JSON.stringify(body));
  }

  disconnect() {
    this.unsubscribeAll();
    if (this.stomp) {
      this.stomp.disconnect();
      this.stomp = null;
    }
    this.connected = false;
    this.connecting = false;
  }
}

export default new WebSocketClient();

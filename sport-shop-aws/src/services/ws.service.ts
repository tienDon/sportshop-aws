// src/services/ws.service.ts
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const WS_URL =
  "http://http://sportshop-backend-env.eba-rmvficqm.ap-southeast-1.elasticbeanstalk.com/ws/chat/ws/chat";

class WebSocketClient {
  private stomp: any = null;
  private connected = false;
  private connecting = false;
  private subscriptions: Record<string, any> = {};

  connect(onConnected?: () => void, onError?: (err: any) => void) {
    if (this.connected || this.connecting) {
      return;
    }

    this.connecting = true;

    const socket = new SockJS(WS_URL);
    this.stomp = Stomp.over(socket);
    this.stomp.debug = () => {};

    this.stomp.connect(
      {},
      () => {
        this.connected = true;
        this.connecting = false;
        onConnected && onConnected();
      },
      (err: any) => {
        console.error("WS connect error", err);
        this.connected = false;
        this.connecting = false;
        onError && onError(err);
      }
    );
  }

  subscribeRoom(roomId: number, callback: (msg: any) => void) {
    if (!this.connected || !this.stomp) return;

    const path = `/topic/room/${roomId}`;
    if (this.subscriptions[path]) {
      return this.subscriptions[path];
    }

    const sub = this.stomp.subscribe(path, (msg: any) => {
      callback(JSON.parse(msg.body));
    });

    this.subscriptions[path] = sub;
    return sub;
  }

  // tuỳ BE nếu có topic push room mới cho admin
  subscribeAdminRoomUpdated(callback: (msg: any) => void) {
    if (!this.connected || !this.stomp) return;

    const path = `/topic/admin/rooms`;
    if (this.subscriptions[path]) {
      return this.subscriptions[path];
    }

    const sub = this.stomp.subscribe(path, (msg: any) => {
      callback(JSON.parse(msg.body));
    });

    this.subscriptions[path] = sub;
    return sub;
  }

  // nhận string hoặc object, rồi wrap đúng ChatMessageRequest cho BE
  sendMessage(
    roomId: number,
    payload:
      | string
      | { content: any; fileUrl?: string | null; contentType?: string }
  ) {
    if (!this.connected || !this.stomp) return;

    let body: any;

    if (typeof payload === "string") {
      body = {
        content: payload,
        fileUrl: null,
        contentType: "TEXT",
      };
    } else {
      body = {
        content: payload.content ?? "",
        fileUrl: payload.fileUrl ?? null,
        contentType: payload.contentType ?? "TEXT",
      };
    }

    this.stomp.send(`/app/chat.send/${roomId}`, {}, JSON.stringify(body));
  }

  unsubscribeAll() {
    Object.values(this.subscriptions).forEach((sub) => {
      try {
        sub.unsubscribe();
      } catch (_) {}
    });
    this.subscriptions = {};
  }

  disconnect() {
    this.unsubscribeAll();
    if (this.stomp) {
      this.stomp.disconnect();
      this.stomp = null;
    }
    this.connected = false;
  }
}

const ws = new WebSocketClient();
export default ws;

class PeerService {
  peer: RTCPeerConnection | null;
  constructor() {
    if (typeof RTCPeerConnection !== "undefined") {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    } else {
      this.peer = null;
      console.error("RTCPeerConnection is not defined");
    }
  }
  async getAnswer(offer: RTCSessionDescriptionInit) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }
  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
    }
  }
  async setDescription(desc: RTCSessionDescriptionInit) {
    if (this.peer) {
      await this.peer.setRemoteDescription(desc);
    }
  }
}

const peerServiceInstance = new PeerService();
export default peerServiceInstance;

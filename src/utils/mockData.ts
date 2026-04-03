export interface Packet {
  id: string;
  no: number;
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  length: number;
  info: string;
}

const protocols = ["TCP", "UDP", "HTTP", "DNS", "TLSv1.2", "ICMP"];
const sources = ["192.168.1.10", "192.168.1.15", "10.0.0.1", "8.8.8.8", "1.1.1.1"];
const destinations = ["104.21.3.4", "192.168.1.1", "8.8.4.4", "172.217.14.206", "192.168.1.255"];
const infos = [
  "443 → 50432 [ACK] Seq=1 Ack=1 Win=65535 Len=0",
  "Standard query 0x1234 A google.com",
  "GET /api/v1/users HTTP/1.1",
  "Client Hello",
  "Echo (ping) request",
  "53 → 50111 Standard query response 0x1234 A 142.250.190.46"
];

let packetCounter = 0;

export function generateMockPacket(): Packet {
  packetCounter++;
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const destination = destinations[Math.floor(Math.random() * destinations.length)];
  const info = infos[Math.floor(Math.random() * infos.length)];
  const length = Math.floor(Math.random() * 1500) + 64;

  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

  return {
    id: `pkt_${packetCounter}`,
    no: packetCounter,
    timestamp,
    source,
    destination,
    protocol,
    length,
    info
  };
}
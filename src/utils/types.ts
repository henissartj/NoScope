export interface Packet {
  id: string;
  no: number;
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  length: number;
  info: string;
  state?: string;
  hexDump?: string;
  payloadText?: string;
}
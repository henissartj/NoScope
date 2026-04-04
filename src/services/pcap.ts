// Generates a mock Ethernet frame containing IPv4 + TCP payload for PCAP compatibility
export function createMockPacketBuffer(srcIp: string, dstIp: string, srcPort: number, dstPort: number, payloadStr: string): any {
  // @ts-ignore
  const Buffer = window.require ? window.require('buffer').Buffer : null;
  if (!Buffer) return null;

  const payload = Buffer.from(payloadStr, 'utf8');
  
  const ethHeader = Buffer.alloc(14);
  // Dst MAC: 00:11:22:33:44:55
  ethHeader.write('001122334455', 0, 'hex');
  // Src MAC: 66:77:88:99:aa:bb
  ethHeader.write('66778899aabb', 6, 'hex');
  // EtherType: IPv4 (0800)
  ethHeader.writeUInt16BE(0x0800, 12);

  const ipHeader = Buffer.alloc(20);
  ipHeader[0] = 0x45; // Version 4, IHL 5
  ipHeader[1] = 0x00; // TOS
  ipHeader.writeUInt16BE(20 + 20 + payload.length, 2); // Total length
  ipHeader.writeUInt16BE(0x1234, 4); // ID
  ipHeader.writeUInt16BE(0x4000, 6); // Flags + Fragment offset (Don't fragment)
  ipHeader[8] = 64; // TTL
  ipHeader[9] = 6; // Protocol (TCP)
  ipHeader.writeUInt16BE(0, 10); // Checksum (0 for mock)
  
  const srcParts = srcIp.split('.').map(Number);
  const dstParts = dstIp.split('.').map(Number);
  
  if (srcParts.length === 4 && dstParts.length === 4) {
    ipHeader.writeUInt8(srcParts[0], 12);
    ipHeader.writeUInt8(srcParts[1], 13);
    ipHeader.writeUInt8(srcParts[2], 14);
    ipHeader.writeUInt8(srcParts[3], 15);
    
    ipHeader.writeUInt8(dstParts[0], 16);
    ipHeader.writeUInt8(dstParts[1], 17);
    ipHeader.writeUInt8(dstParts[2], 18);
    ipHeader.writeUInt8(dstParts[3], 19);
  }

  const tcpHeader = Buffer.alloc(20);
  tcpHeader.writeUInt16BE(srcPort, 0);
  tcpHeader.writeUInt16BE(dstPort, 2);
  tcpHeader.writeUInt32BE(0x11223344, 4); // Seq
  tcpHeader.writeUInt32BE(0x55667788, 8); // Ack
  tcpHeader[12] = 0x50; // Data offset (5 words)
  tcpHeader[13] = 0x18; // Flags (PSH, ACK)
  tcpHeader.writeUInt16BE(8192, 14); // Window
  tcpHeader.writeUInt16BE(0, 16); // Checksum
  tcpHeader.writeUInt16BE(0, 18); // Urgent pointer

  return Buffer.concat([ethHeader, ipHeader, tcpHeader, payload]);
}

export function generateHexDump(buffer: any): string {
  if (!buffer) return '';
  let dump = '';
  for (let i = 0; i < buffer.length; i += 16) {
    const chunk = buffer.slice(i, i + 16);
    const hex = Array.from(chunk as number[]).map(b => b.toString(16).padStart(2, '0')).join(' ');
    const ascii = Array.from(chunk as number[]).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
    
    const offset = i.toString(16).padStart(4, '0');
    dump += `${offset}  ${hex.padEnd(48, ' ')}  ${ascii}\n`;
  }
  return dump;
}

export function writePcapFile(packets: any[]): any {
  // @ts-ignore
  const Buffer = window.require ? window.require('buffer').Buffer : null;
  if (!Buffer) return null;

  // Global Header
  const globalHeader = Buffer.alloc(24);
  globalHeader.writeUInt32LE(0xa1b2c3d4, 0); // Magic number
  globalHeader.writeUInt16LE(2, 4); // Version major
  globalHeader.writeUInt16LE(4, 6); // Version minor
  globalHeader.writeInt32LE(0, 8); // Thiszone
  globalHeader.writeUInt32LE(0, 12); // Sigfigs
  globalHeader.writeUInt32LE(65535, 16); // Snaplen
  globalHeader.writeUInt32LE(1, 20); // Network (1 = Ethernet)

  const packetBuffers: any[] = [];
  
  packets.forEach(p => {
    let payload = p.payloadText || "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n";
    let srcIp = '192.168.1.1', dstIp = '8.8.8.8';
    let srcPort = 12345, dstPort = 80;
    
    try {
      const srcMatch = p.source.match(/([0-9\.]+):(\d+)/);
      if (srcMatch) { srcIp = srcMatch[1]; srcPort = parseInt(srcMatch[2]); }
      const dstMatch = p.destination.match(/([0-9\.]+):(\d+)/);
      if (dstMatch) { dstIp = dstMatch[1]; dstPort = parseInt(dstMatch[2]); }
    } catch(e) {}

    const pktData = createMockPacketBuffer(srcIp, dstIp, srcPort, dstPort, payload);
    if (!pktData) return;
    
    const pktHeader = Buffer.alloc(16);
    const sec = Math.floor(Date.now() / 1000);
    const microsec = (Date.now() % 1000) * 1000;
    
    pktHeader.writeUInt32LE(sec, 0);
    pktHeader.writeUInt32LE(microsec, 4);
    pktHeader.writeUInt32LE(pktData.length, 8); // Incl len
    pktHeader.writeUInt32LE(pktData.length, 12); // Orig len
    
    packetBuffers.push(Buffer.concat([pktHeader, pktData]));
  });

  return Buffer.concat([globalHeader, ...packetBuffers]);
}
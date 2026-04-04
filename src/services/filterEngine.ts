import { Packet } from '../utils/types';

/**
 * Filter Engine for NoScope (Wireshark-like syntax)
 * Supported syntax examples:
 * - tcp.port == 443
 * - ip.addr == 192.168.1.1
 * - protocol == TCP
 */

export interface FilterResult {
  isValid: boolean;
  error?: string;
  evaluate: (packet: Packet) => boolean;
}

export function compileFilter(query: string): FilterResult {
  if (!query || query.trim() === "") {
    return { isValid: true, evaluate: () => true };
  }

  try {
    // If there's no operator, fall back to simple text search
    if (!query.includes("==") && !query.includes("!=") && !query.includes(">") && !query.includes("<") && !query.includes("contains")) {
      const searchTerm = query.toLowerCase();
      return {
        isValid: true,
        evaluate: (packet) => 
          packet.source.toLowerCase().includes(searchTerm) ||
          packet.destination.toLowerCase().includes(searchTerm) ||
          packet.protocol.toLowerCase().includes(searchTerm) ||
          packet.info.toLowerCase().includes(searchTerm) ||
          (packet.state && packet.state.toLowerCase().includes(searchTerm)) || false
      };
    }

    const evaluate = (packet: Packet): boolean => {
      // Split by common logical operators for basic support (AND/OR not fully recursive here, left-to-right eval)
      const parts = query.split(/\s+(&&|\|\|)\s+/);
      
      let finalResult = true;
      let currentLogic = '&&';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        
        if (part === '&&' || part === '||') {
          currentLogic = part;
          continue;
        }

        // Parse condition: field operator value
        const match = part.match(/([a-zA-Z0-9._]+)\s*(==|!=|>=|<=|>|<|contains)\s*"?([^"]*)"?/i);
        if (!match) {
          // Fallback to text search for this part
          const isMatch = 
            packet.source.toLowerCase().includes(part.toLowerCase()) ||
            packet.destination.toLowerCase().includes(part.toLowerCase()) ||
            packet.protocol.toLowerCase().includes(part.toLowerCase()) ||
            packet.info.toLowerCase().includes(part.toLowerCase());
            
          finalResult = currentLogic === '&&' ? (finalResult && isMatch) : (finalResult || isMatch);
          continue;
        }

        const field = match[1].toLowerCase();
        const operator = match[2];
        const value = match[3].toLowerCase();

        let fieldValStr = "";
        let fieldValNum: number | null = null;

        // Extract field values from packet
        const srcIpMatch = packet.source.match(/([0-9\.]+)/);
        const srcPortMatch = packet.source.match(/:(\d+)/);
        const dstIpMatch = packet.destination.match(/([0-9\.]+)/);
        const dstPortMatch = packet.destination.match(/:(\d+)/);

        const srcIp = srcIpMatch ? srcIpMatch[1] : packet.source;
        const srcPort = srcPortMatch ? parseInt(srcPortMatch[1]) : null;
        const dstIp = dstIpMatch ? dstIpMatch[1] : packet.destination;
        const dstPort = dstPortMatch ? parseInt(dstPortMatch[1]) : null;

        if (field === 'ip.addr') {
          // Special case: check both
          const matchSrc = compare(srcIp, operator, value, null);
          const matchDst = compare(dstIp, operator, value, null);
          const conditionRes = matchSrc || matchDst;
          finalResult = currentLogic === '&&' ? (finalResult && conditionRes) : (finalResult || conditionRes);
          continue;
        } else if (field === 'tcp.port' || field === 'udp.port' || field === 'port') {
          // Special case: check both ports
          const matchSrc = srcPort !== null ? compare(srcPort.toString(), operator, value, srcPort) : false;
          const matchDst = dstPort !== null ? compare(dstPort.toString(), operator, value, dstPort) : false;
          const conditionRes = matchSrc || matchDst;
          finalResult = currentLogic === '&&' ? (finalResult && conditionRes) : (finalResult || conditionRes);
          continue;
        } else if (field === 'ip.src') {
          fieldValStr = srcIp;
        } else if (field === 'ip.dst') {
          fieldValStr = dstIp;
        } else if (field === 'tcp.srcport' || field === 'udp.srcport') {
          fieldValStr = srcPort?.toString() || "";
          fieldValNum = srcPort;
        } else if (field === 'tcp.dstport' || field === 'udp.dstport') {
          fieldValStr = dstPort?.toString() || "";
          fieldValNum = dstPort;
        } else if (field === 'frame.len' || field === 'length') {
          fieldValStr = packet.length.toString();
          fieldValNum = packet.length;
        } else if (field === 'protocol') {
          fieldValStr = packet.protocol.toLowerCase();
        } else {
          // Unknown field
          finalResult = currentLogic === '&&' ? false : finalResult;
          continue;
        }

        const conditionRes = compare(fieldValStr, operator, value, fieldValNum);
        finalResult = currentLogic === '&&' ? (finalResult && conditionRes) : (finalResult || conditionRes);
      }

      return finalResult;
    };

    return { isValid: true, evaluate };
  } catch (e) {
    return { 
      isValid: false, 
      error: "Syntaxe invalide. Essayez: tcp.port == 443",
      evaluate: () => false 
    };
  }
}

function compare(actualStr: string, operator: string, expectedValue: string, actualNum: number | null): boolean {
  if (actualNum !== null && !isNaN(Number(expectedValue))) {
    const expectedNum = Number(expectedValue);
    switch (operator) {
      case '==': return actualNum === expectedNum;
      case '!=': return actualNum !== expectedNum;
      case '>': return actualNum > expectedNum;
      case '<': return actualNum < expectedNum;
      case '>=': return actualNum >= expectedNum;
      case '<=': return actualNum <= expectedNum;
      default: return false;
    }
  }

  const a = actualStr.toLowerCase();
  const b = expectedValue.toLowerCase();

  switch (operator) {
    case '==': return a === b;
    case '!=': return a !== b;
    case 'contains': return a.includes(b);
    default: return false;
  }
}
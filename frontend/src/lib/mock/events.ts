export type EventType = "info" | "warn" | "success" | "error";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: EventType;
  message: string;
  source?: string;
}

export const recentActivity: TimelineEvent[] = [
  {
    id: "ev-001",
    timestamp: "12:41:02",
    type: "success",
    message: "Lab session started: Python Pickle Sandbox",
    source: "session-manager",
  },
  {
    id: "ev-002",
    timestamp: "12:41:15",
    type: "info",
    message: "Runtime fingerprint collected: Python 3.11.4, pickle v5",
    source: "fingerprint-engine",
  },
  {
    id: "ev-003",
    timestamp: "12:42:03",
    type: "warn",
    message: "Unsafe deserialization boundary detected in target",
    source: "analysis-engine",
  },
  {
    id: "ev-004",
    timestamp: "12:43:11",
    type: "success",
    message: "Callback received: SERIAL_LAB_EXECUTION_CONFIRMED",
    source: "callback-server",
  },
  {
    id: "ev-005",
    timestamp: "12:43:14",
    type: "error",
    message: "Finding DHY-001 created: CRITICAL severity",
    source: "findings-engine",
  },
  {
    id: "ev-006",
    timestamp: "12:44:02",
    type: "info",
    message: "Scanner run: PickleScan detected payload",
    source: "scanner-lab",
  },
];

export const callbackEvents: TimelineEvent[] = [
  {
    id: "cb-001",
    timestamp: "12:41:02",
    type: "info",
    message: "LAB EVENT: Pickle deserialization initiated",
    source: "python-pickle-lab",
  },
  {
    id: "cb-002",
    timestamp: "12:41:03",
    type: "success",
    message: "CALLBACK: SERIAL_LAB_EXECUTION_CONFIRMED",
    source: "callback-server",
  },
  {
    id: "cb-003",
    timestamp: "12:41:03",
    type: "info",
    message: "EVENT: callback_id=cb_7f3a source=python-pickle-lab",
    source: "callback-server",
  },
  {
    id: "cb-004",
    timestamp: "12:41:04",
    type: "error",
    message: "FINDING: Unsafe deserialization boundary confirmed",
    source: "analysis-engine",
  },
  {
    id: "cb-005",
    timestamp: "12:41:05",
    type: "info",
    message: "EVENT: Gadget chain resolved: __reduce__ → subprocess.Popen",
    source: "chain-analyzer",
  },
  {
    id: "cb-006",
    timestamp: "12:41:07",
    type: "success",
    message: "LAB COMPLETE: Session cb_7f3a concluded successfully",
    source: "session-manager",
  },
];

export const researchEvents: TimelineEvent[] = [
  {
    id: "re-001",
    timestamp: "14:22:01",
    type: "info",
    message: "Session initialized: Python 3.11 / Pickle v5",
    source: "runtime",
  },
  {
    id: "re-002",
    timestamp: "14:22:02",
    type: "info",
    message: "Object parsed: class=os.system reduce_args=['id']",
    source: "parser",
  },
  {
    id: "re-003",
    timestamp: "14:22:03",
    type: "warn",
    message: "SUSPICIOUS: __reduce__ returns callable os.system",
    source: "analyzer",
  },
  {
    id: "re-004",
    timestamp: "14:22:04",
    type: "warn",
    message: "DANGEROUS PRIMITIVE: subprocess.Popen in gadget chain",
    source: "chain-engine",
  },
  {
    id: "re-005",
    timestamp: "14:22:05",
    type: "error",
    message: "RISK HIGH: Arbitrary OS command execution possible",
    source: "risk-engine",
  },
  {
    id: "re-006",
    timestamp: "14:22:06",
    type: "success",
    message: "Analysis complete. 1 critical finding logged.",
    source: "session-manager",
  },
];

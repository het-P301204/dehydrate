export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type FindingStatus = "Open" | "In Review" | "Remediated" | "Closed";

export interface Finding {
  id: string;
  title: string;
  severity: FindingSeverity;
  format: string;
  runtime: string;
  status: FindingStatus;
  discoveredAt: string;
  evidence: string;
  impact: string;
  remediation: string;
  references: string[];
  labId?: number;
}

export const findings: Finding[] = [
  {
    id: "DHY-001",
    title: "Unsafe pickle deserialization via user input",
    severity: "CRITICAL",
    format: "Pickle",
    runtime: "Python 3.11",
    status: "Open",
    discoveredAt: "2026-09-28 14:23:01",
    evidence:
      "Lab confirmed execution of synthetic marker via pickle.loads() called on unvalidated user-controlled data. Callback received: SERIAL_LAB_EXECUTION_CONFIRMED.",
    impact:
      "Arbitrary code execution in the context of the deserializing process. Full system compromise possible when running without sandbox isolation.",
    remediation:
      "Replace pickle with a safe serialization format (JSON, MessagePack, Protocol Buffers). If pickle is required, validate input source, implement allowlist-based deserialization, and run in isolated sandbox.",
    references: [
      "https://docs.python.org/3/library/pickle.html#restrict-globals",
      "CWE-502: Deserialization of Untrusted Data",
      "OWASP A08:2021 – Software and Data Integrity Failures",
    ],
    labId: 1,
  },
  {
    id: "DHY-002",
    title: "ML model arbitrary code execution",
    severity: "HIGH",
    format: "Pickle",
    runtime: "Python 3.11",
    status: "Open",
    discoveredAt: "2026-09-29 09:11:44",
    evidence:
      "PyTorch model file (.pkl) containing __reduce__ override executed synthetic marker on torch.load(). PickleScan detected payload; ModelScan missed variant.",
    impact:
      "Malicious model files distributed via public repositories or model hubs can execute arbitrary code when loaded by researchers or production systems.",
    remediation:
      "Use SafeTensors format for model weights. Implement model signature verification. Reject pickle-based model files from untrusted sources. Scan all model artifacts before loading.",
    references: [
      "https://huggingface.co/docs/safetensors",
      "CVE-2025-XXXX: PyTorch unsafe pickle deserialization",
      "CWE-502",
    ],
    labId: 5,
  },
  {
    id: "DHY-003",
    title: "Java gadget chain via ObjectInputStream",
    severity: "HIGH",
    format: "Java Serialization",
    runtime: "JDK 11",
    status: "In Review",
    discoveredAt: "2026-09-30 16:45:22",
    evidence:
      "Commons Collections 3.1 chain confirmed via InvokerTransformer → ChainedTransformer → Runtime.exec path. Synthetic execution marker triggered in lab sandbox.",
    impact:
      "Remote code execution via Java deserialization endpoint. Any service accepting serialized Java objects without allowlisting is vulnerable.",
    remediation:
      "Implement ObjectInputFilter with strict allowlist. Upgrade Commons Collections to patched version. Use SerialKiller or NotSoSerial for runtime protection.",
    references: [
      "https://frohoff.github.io/appseccali-marshalling-pickles",
      "CVE-2015-4852: Commons Collections",
      "CWE-502",
    ],
    labId: 6,
  },
  {
    id: "DHY-004",
    title: "ViewState deserialization without MAC",
    severity: "MEDIUM",
    format: "ViewState",
    runtime: ".NET 6",
    status: "Open",
    discoveredAt: "2026-10-01 11:02:33",
    evidence:
      "ASP.NET application confirmed to accept ViewState without MAC validation (EnableViewStateMac=false). BinaryFormatter gadget chain exercised in isolated lab.",
    impact:
      "Authenticated or unauthenticated attackers can forge ViewState to trigger deserialization gadget chains, potentially achieving RCE.",
    remediation:
      "Enable EnableViewStateMac. Use encrypted ViewState. Migrate to JSON-based state management. Disable BinaryFormatter (deprecated in .NET 5+).",
    references: [
      "https://docs.microsoft.com/en-us/aspnet/core/security/data-protection",
      "CWE-502",
    ],
    labId: 7,
  },
  {
    id: "DHY-005",
    title: "Celery task deserialization RCE",
    severity: "HIGH",
    format: "Pickle",
    runtime: "Python 3.11",
    status: "Remediated",
    discoveredAt: "2026-09-25 08:30:11",
    evidence:
      "Celery workers configured with pickle serializer accept task messages from broker. Crafted task message triggered synthetic execution via __reduce__ on deserialization.",
    impact:
      "Any party with write access to the message broker (Redis/RabbitMQ) can execute arbitrary code in all Celery worker processes.",
    remediation:
      "Set CELERY_TASK_SERIALIZER='json' and CELERY_ACCEPT_CONTENT=['json']. Implement broker authentication. Network-isolate broker from untrusted parties.",
    references: [
      "https://docs.celeryq.dev/en/stable/userguide/security.html",
      "CWE-502",
    ],
    labId: 1,
  },
  {
    id: "DHY-006",
    title: "Missing model signature verification",
    severity: "MEDIUM",
    format: "Pickle",
    runtime: "Python 3.11",
    status: "Open",
    discoveredAt: "2026-10-01 14:55:09",
    evidence:
      "ML pipeline loads model files without cryptographic signature verification. Substituted synthetic model file was loaded without warning or rejection.",
    impact:
      "Supply chain attack: compromised model repository or MITM attack can deliver malicious model files to production ML inference systems.",
    remediation:
      "Implement model signing with sigstore or similar. Verify signatures before model loading. Use immutable artifact stores with content addressing.",
    references: [
      "https://www.sigstore.dev",
      "OWASP A08:2021 – Software and Data Integrity Failures",
    ],
    labId: 13,
  },
  {
    id: "DHY-007",
    title: "Scanner detection gap - Variant B",
    severity: "INFO",
    format: "Multiple",
    runtime: "Multiple",
    status: "Open",
    discoveredAt: "2026-10-02 07:12:44",
    evidence:
      "PickleScan v0.0.24 fails to detect obfuscated pickle payloads using INST opcode sequences. ModelScan misses payloads embedded in model metadata fields.",
    impact:
      "Security teams relying solely on automated scanners may miss embedded payloads, creating a false sense of security.",
    remediation:
      "Use multiple scanners in parallel. Implement strict allowlisting of expected class names. Consider custom YARA rules for known obfuscation patterns.",
    references: ["PickleScan GitHub Issues", "CWE-693: Protection Mechanism Failure"],
    labId: 4,
  },
];

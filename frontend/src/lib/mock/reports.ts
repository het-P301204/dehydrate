export interface Report {
  id: string;
  title: string;
  template: string;
  generatedAt: string;
  dateRange: { from: string; to: string };
  content: string;
}

export const mockReport: Report = {
  id: "rpt-001",
  title: "DEHYDRATE Research Session — Executive Summary",
  template: "Executive Report",
  generatedAt: "2026-10-02 07:30:00",
  dateRange: { from: "2026-09-25", to: "2026-10-02" },
  content: `# DEHYDRATE Research Session Report
**Classification:** AUTHORIZED LAB RESEARCH ONLY
**Generated:** 2026-10-02
**Session ID:** INV-SESSION-2026-Q4-001

---

## Executive Summary

This report summarizes findings from an authorized DEHYDRATE deserialization security research session conducted from 2026-09-25 to 2026-10-02. The research focused on Python pickle deserialization, Java serialization gadget chains, and ML model serialization risks.

**Key Findings:** 7 findings identified (1 Critical, 4 High, 2 Medium)

---

## Scope

- **Languages:** Python 3.11, Java 11 (JDK), .NET 6
- **Libraries:** pickle, commons-collections 3.1, BinaryFormatter, Celery, Dask, PyTorch
- **Labs Completed:** 2 of 25 (Beginner tier)

---

## Critical Finding: DHY-001

**Unsafe pickle deserialization via user input**
**Severity:** CRITICAL
**Format:** Python Pickle v5
**Runtime:** Python 3.11 (Docker sandbox)

The lab confirmed that calling \`pickle.loads()\` on unvalidated user-controlled bytes allows an attacker to execute arbitrary code in the deserializing process.

**Evidence:** Callback confirmed: \`SERIAL_LAB_EXECUTION_CONFIRMED\`
**Gadget Chain:** \`bytes → pickle.loads → __reduce__ → subprocess.Popen → OS command\`

**Remediation:**
- Replace pickle with JSON/MessagePack for data exchange
- If pickle required: implement RestrictedUnpickler with class allowlist
- Wrap deserialization in isolated sandbox (seccomp, nsjail)

---

## High Severity Findings

### DHY-002: ML Model Arbitrary Code Execution
PyTorch model files using pickle backend can embed arbitrary code that executes on \`torch.load()\`. PickleScan detected the standard payload; ModelScan missed a variant using INST opcode obfuscation.

### DHY-003: Java Gadget Chain via ObjectInputStream
Commons Collections 3.1 chain confirmed operational in JDK 11. InvokerTransformer → ChainedTransformer → Runtime.exec() path achieved code execution.

### DHY-005: Celery Task Deserialization RCE *(Remediated)*
Celery workers with pickle serializer configured accepted crafted task messages. Remediated by setting \`CELERY_TASK_SERIALIZER=json\`.

---

## Scanner Coverage

| Scanner | Detection Rate | Notes |
|---------|---------------|-------|
| PickleScan | 82% | Misses INST opcode obfuscation |
| ModelScan | 68% | Misses metadata embedding |
| DEHYDRATE Custom | 95% | Covers known obfuscation patterns |

---

## Recommendations

1. **Immediate:** Replace pickle with safe serialization formats in all untrusted input paths
2. **Short-term:** Implement model signature verification for all ML artifacts
3. **Medium-term:** Deploy layered scanning (PickleScan + ModelScan + custom rules)
4. **Long-term:** Migrate to SafeTensors for model weight storage

---

*AUTHORIZED LAB RESEARCH — All findings produced in isolated lab environment*
`,
};

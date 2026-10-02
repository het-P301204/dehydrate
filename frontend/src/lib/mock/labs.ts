export type LabDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type LabLanguage = "Python" | "Java" | ".NET" | "Multi";
export type LabStatus = "Not Started" | "In Progress" | "Completed";

export interface Lab {
  id: number;
  title: string;
  difficulty: LabDifficulty;
  language: LabLanguage;
  status: LabStatus;
  description: string;
  estimatedMinutes: number;
  tags: string[];
}

export const labs: Lab[] = [
  {
    id: 1,
    title: "Unsafe Python Pickle Deserialization",
    difficulty: "Beginner",
    language: "Python",
    status: "Completed",
    description:
      "Analyze how Python pickle protocol enables arbitrary code execution through crafted serialized objects.",
    estimatedMinutes: 30,
    tags: ["pickle", "python", "rce", "deserialization"],
  },
  {
    id: 2,
    title: "Object Reconstruction & State Injection",
    difficulty: "Beginner",
    language: "Python",
    status: "In Progress",
    description:
      "Understand how deserializers reconstruct object state and how malicious state can be injected.",
    estimatedMinutes: 25,
    tags: ["state", "object-graph", "injection"],
  },
  {
    id: 3,
    title: "Gadget Chain Fundamentals",
    difficulty: "Intermediate",
    language: "Multi",
    status: "Not Started",
    description:
      "Learn the building blocks of gadget chains and how existing library code becomes an exploit primitive.",
    estimatedMinutes: 45,
    tags: ["gadgets", "chains", "fundamentals"],
  },
  {
    id: 4,
    title: "Scanner Detection Analysis",
    difficulty: "Intermediate",
    language: "Multi",
    status: "Not Started",
    description:
      "Test serialized payloads against PickleScan, ModelScan, and custom detectors. Understand detection gaps.",
    estimatedMinutes: 40,
    tags: ["scanner", "detection", "picklescan", "modelscan"],
  },
  {
    id: 5,
    title: "ML Model Serialization Risks",
    difficulty: "Intermediate",
    language: "Python",
    status: "Not Started",
    description:
      "Examine how PyTorch and scikit-learn models embed arbitrary code via pickle backends.",
    estimatedMinutes: 50,
    tags: ["ml", "pytorch", "sklearn", "model"],
  },
  {
    id: 6,
    title: "Java Serialization & ObjectInputStream",
    difficulty: "Intermediate",
    language: "Java",
    status: "Not Started",
    description:
      "Explore Java serialization format, ObjectInputStream deserialization, and exploit surface.",
    estimatedMinutes: 60,
    tags: ["java", "objectinputstream", "serialization"],
  },
  {
    id: 7,
    title: ".NET ViewState Exploitation Concepts",
    difficulty: "Intermediate",
    language: ".NET",
    status: "Not Started",
    description:
      "Analyze ASP.NET ViewState deserialization without MAC validation and gadget chain potential.",
    estimatedMinutes: 55,
    tags: ["dotnet", "viewstate", "aspnet", "mac"],
  },
  {
    id: 8,
    title: "Defensive Deserialization Patterns",
    difficulty: "Beginner",
    language: "Multi",
    status: "Not Started",
    description:
      "Study allowlisting, type filtering, sandboxing, and other defensive measures.",
    estimatedMinutes: 35,
    tags: ["defense", "allowlist", "filtering", "sandbox"],
  },
  {
    id: 9,
    title: "Pickle Protocol Deep Dive (v0–v5)",
    difficulty: "Advanced",
    language: "Python",
    status: "Not Started",
    description:
      "Examine all pickle protocol versions, opcode structure, and how protocol selection affects attack surface.",
    estimatedMinutes: 70,
    tags: ["pickle", "protocol", "opcodes", "v5"],
  },
  {
    id: 10,
    title: "__reduce__ Magic Method Mechanics",
    difficulty: "Intermediate",
    language: "Python",
    status: "Not Started",
    description:
      "Master the __reduce__ and __reduce_ex__ protocol and how it controls object reconstruction.",
    estimatedMinutes: 45,
    tags: ["reduce", "dunder", "python", "protocol"],
  },
  {
    id: 11,
    title: "Java Commons Collections Chain",
    difficulty: "Advanced",
    language: "Java",
    status: "Not Started",
    description:
      "Reconstruct the classic Apache Commons Collections gadget chain and understand its components.",
    estimatedMinutes: 90,
    tags: ["java", "commons-collections", "gadget", "chain"],
  },
  {
    id: 12,
    title: ".NET BinaryFormatter Gadget Analysis",
    difficulty: "Advanced",
    language: ".NET",
    status: "Not Started",
    description:
      "Analyze BinaryFormatter deserialization gadget chains in the .NET ecosystem.",
    estimatedMinutes: 80,
    tags: ["dotnet", "binaryformatter", "gadget"],
  },
  {
    id: 13,
    title: "ML Model Poisoning via Pickle",
    difficulty: "Advanced",
    language: "Python",
    status: "Not Started",
    description:
      "Demonstrate how model files can embed malicious pickle payloads that execute on model load.",
    estimatedMinutes: 65,
    tags: ["ml", "poisoning", "pickle", "model"],
  },
  {
    id: 14,
    title: "Scanner Detection Gap Research",
    difficulty: "Advanced",
    language: "Multi",
    status: "Not Started",
    description:
      "Identify and document detection gaps in commercial and open-source deserialization scanners.",
    estimatedMinutes: 75,
    tags: ["scanner", "detection-gap", "research"],
  },
  {
    id: 15,
    title: "OOB Callback Mechanics",
    difficulty: "Intermediate",
    language: "Python",
    status: "Not Started",
    description:
      "Set up and analyze out-of-band callback channels for confirming blind deserialization execution.",
    estimatedMinutes: 40,
    tags: ["oob", "callback", "dns", "http"],
  },
  {
    id: 16,
    title: "Multi-Stage Gadget Chain Composition",
    difficulty: "Expert",
    language: "Java",
    status: "Not Started",
    description:
      "Compose complex multi-stage gadget chains that chain through multiple libraries.",
    estimatedMinutes: 120,
    tags: ["gadget", "chain", "multi-stage", "composition"],
  },
  {
    id: 17,
    title: "Object Graph Traversal Analysis",
    difficulty: "Intermediate",
    language: "Multi",
    status: "Not Started",
    description:
      "Visualize and analyze the object graphs produced during deserialization.",
    estimatedMinutes: 50,
    tags: ["object-graph", "traversal", "analysis"],
  },
  {
    id: 18,
    title: "Binary Serialization Format Inspection",
    difficulty: "Advanced",
    language: "Multi",
    status: "Not Started",
    description:
      "Inspect raw binary formats: pickle opcodes, Java class descriptors, .NET NRBF records.",
    estimatedMinutes: 85,
    tags: ["binary", "format", "inspection", "hex"],
  },
  {
    id: 19,
    title: "Environment & Runtime Fingerprinting",
    difficulty: "Intermediate",
    language: "Multi",
    status: "Not Started",
    description:
      "Identify deserialization libraries, runtime versions, and dangerous package combinations.",
    estimatedMinutes: 35,
    tags: ["fingerprint", "runtime", "environment"],
  },
  {
    id: 20,
    title: "Cross-Language Serialization Comparison",
    difficulty: "Intermediate",
    language: "Multi",
    status: "Not Started",
    description:
      "Compare Python pickle, Java serialization, and .NET serialization: formats, risks, mitigations.",
    estimatedMinutes: 55,
    tags: ["comparison", "cross-language", "formats"],
  },
  {
    id: 21,
    title: "Signed Object Integrity Verification",
    difficulty: "Intermediate",
    language: "Multi",
    status: "Not Started",
    description:
      "Implement and analyze HMAC/signature schemes for serialized object integrity.",
    estimatedMinutes: 45,
    tags: ["signing", "hmac", "integrity", "verification"],
  },
  {
    id: 22,
    title: "Type Confusion via Deserialization",
    difficulty: "Advanced",
    language: "Java",
    status: "Not Started",
    description:
      "Exploit type confusion vulnerabilities that emerge during object graph reconstruction.",
    estimatedMinutes: 70,
    tags: ["type-confusion", "cast", "java"],
  },
  {
    id: 23,
    title: "Deserialization Attack Surface in Microservices",
    difficulty: "Advanced",
    language: "Multi",
    status: "Not Started",
    description:
      "Map deserialization trust boundaries across microservice architectures and message queues.",
    estimatedMinutes: 90,
    tags: ["microservices", "attack-surface", "queues"],
  },
  {
    id: 24,
    title: "Safe Serialization Architecture",
    difficulty: "Intermediate",
    language: "Multi",
    status: "Not Started",
    description:
      "Design serialization systems using safe alternatives: Protocol Buffers, SafeTensors, ONNX.",
    estimatedMinutes: 60,
    tags: ["safe", "protobuf", "safetensors", "onnx"],
  },
  {
    id: 25,
    title: "Defense-in-Depth for Deserialization",
    difficulty: "Expert",
    language: "Multi",
    status: "Not Started",
    description:
      "Implement layered defenses: type allowlisting, sandboxing, monitoring, and circuit breakers.",
    estimatedMinutes: 100,
    tags: ["defense-in-depth", "layered", "monitoring"],
  },
];

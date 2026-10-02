export interface Sample {
  id: string;
  name: string;
  format: string;
  size: string;
  description: string;
  content: {
    raw: string;
    base64: string;
    hex: string;
  };
  riskLevel: "SAFE" | "SUSPICIOUS" | "DANGEROUS";
  objectStructure: ObjectNode[];
}

export interface ObjectNode {
  id: string;
  label: string;
  type: string;
  suspicious: boolean;
  children?: ObjectNode[];
  value?: string;
}

export const samples: Sample[] = [
  {
    id: "s-001",
    name: "Python Pickle — Basic",
    format: "Pickle v2",
    size: "124 bytes",
    description: "Simple pickle object using __reduce__ to DEHYDRATE os.system",
    content: {
      raw: `\x80\x02cposix\nsystem\nq\x00X\x02\x00\x00\x00idq\x01\x85q\x02Rq\x03.`,
      base64: "gAJjcG9zaXgKc3lzdGVtCnEAWAIAAAAiaWRxAYVxAlJxAy4=",
      hex: "80 02 63 70 6f 73 69 78 0a 73 79 73 74 65 6d 0a 71 00 58 02 00 00 00 69 64 71 01 85 71 02 52 71 03 2e",
    },
    riskLevel: "DANGEROUS",
    objectStructure: [
      {
        id: "root",
        label: "RootObject (os.system)",
        type: "PickleReduce",
        suspicious: true,
        children: [
          {
            id: "cls",
            label: 'class: <class "posix.system">',
            type: "ClassRef",
            suspicious: true,
            value: "posix.system",
          },
          {
            id: "args",
            label: 'reduce_args: ["id"]',
            type: "Args",
            suspicious: false,
            value: '["id"]',
          },
          {
            id: "attrs",
            label: "attributes",
            type: "Dict",
            suspicious: false,
            children: [
              {
                id: "cls2",
                label: "__class__: posix.stat_result",
                type: "ClassRef",
                suspicious: false,
              },
              {
                id: "dict",
                label: "__dict__: {...}",
                type: "Dict",
                suspicious: false,
              },
            ],
          },
          {
            id: "refs",
            label: "references",
            type: "List",
            suspicious: false,
            children: [
              {
                id: "ref-a",
                label: "Object A (benign)",
                type: "Object",
                suspicious: false,
              },
              {
                id: "ref-b",
                label: "Object B — SUSPICIOUS",
                type: "Object",
                suspicious: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "s-002",
    name: "Java Serialized Object",
    format: "Java Serialization",
    size: "287 bytes",
    description: "Java serialized object with Commons Collections gadget chain structure",
    content: {
      raw: "Binary Java object stream (ACED0005 magic bytes)",
      base64:
        "rO0ABXNyAC5vcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMuZnVuY3RvcnMuQ2hhaW5lZFRyYW5zZm9ybWVyMMkYWyfB3AABTAANaVRyYW5zZm9ybWVyc3QALVtMb3JnL2FwYWNoZS9jb21tb25zL2NvbGxlY3Rpb25zL1RyYW5zZm9ybWVyO3hwdXIALVtMb3JnLmFwYWNoZS5jb21tb25zLmNvbGxlY3Rpb25zLlRyYW5zZm9ybWVyO...",
      hex: "AC ED 00 05 73 72 00 2E 6F 72 67 2E 61 70 61 63 68 65 2E 63 6F 6D 6D 6F 6E 73 2E 63 6F 6C 6C 65 63 74 69 6F 6E 73 2E 66 75 6E 63 74 6F 72 73 2E 43 68 61 69 6E 65 64 54 72 61 6E 73 66 6F 72 6D 65 72",
    },
    riskLevel: "DANGEROUS",
    objectStructure: [
      {
        id: "root",
        label: "ChainedTransformer",
        type: "JavaObject",
        suspicious: true,
        children: [
          {
            id: "t1",
            label: "ConstantTransformer",
            type: "JavaObject",
            suspicious: false,
            value: "java.lang.Runtime",
          },
          {
            id: "t2",
            label: "InvokerTransformer (getRuntime)",
            type: "JavaObject",
            suspicious: true,
          },
          {
            id: "t3",
            label: "InvokerTransformer (exec)",
            type: "JavaObject",
            suspicious: true,
            value: "cmd",
          },
        ],
      },
    ],
  },
  {
    id: "s-003",
    name: ".NET ViewState Sample",
    format: "ViewState",
    size: "412 bytes",
    description: "ASP.NET ViewState without MAC validation containing suspicious type references",
    content: {
      raw: "NRBF binary stream",
      base64:
        "/wEFCQwCAAAACwMAAAAlU3lzdGVtLkNvbGxlY3Rpb25zLkhhc2h0YWJsZSxdU3lzdGVtLlJ1bnRpbWUuU2VyaWFsaXphdGlvbi5Gb3JtYXR0ZXJzLkJpbmFyeQQAAAAHbG9hZEtleQd1bmxvY2s=",
      hex: "FF 01 05 09 0C 02 00 00 00 0B 03 00 00 00 25 53 79 73 74 65 6D 2E 43 6F 6C 6C 65 63 74 69 6F 6E 73",
    },
    riskLevel: "SUSPICIOUS",
    objectStructure: [
      {
        id: "root",
        label: "ViewState Root",
        type: "ViewState",
        suspicious: false,
        children: [
          {
            id: "pair",
            label: "Pair (first, second)",
            type: "ViewState.Pair",
            suspicious: false,
          },
          {
            id: "type",
            label: "TypeRef: System.Collections.Hashtable",
            type: "TypeRef",
            suspicious: true,
          },
          {
            id: "mac",
            label: "MAC Signature: MISSING",
            type: "ViewState.MAC",
            suspicious: true,
            value: "NO MAC",
          },
        ],
      },
    ],
  },
  {
    id: "s-004",
    name: "PyTorch Model (.pkl)",
    format: "Pickle v5 (PyTorch)",
    size: "2.1 MB",
    description: "PyTorch model file with embedded pickle payload in model metadata",
    content: {
      raw: "PyTorch ZIP archive with pickle-serialized tensors",
      base64: "UEsDBAAACAAAAAAABc3N0b3JhZ2UucGtsAAAAAAAAAAAAAABQSwMEAAAIAAAAAAAF...",
      hex: "50 4B 03 04 00 00 08 00 00 00 00 00 05 CD CD CD CD CD 73 74 6F 72 61 67 65 2E 70 6B 6C 00 00",
    },
    riskLevel: "DANGEROUS",
    objectStructure: [
      {
        id: "root",
        label: "PyTorch Archive",
        type: "ZipFile",
        suspicious: false,
        children: [
          {
            id: "storage",
            label: "storage.pkl",
            type: "PickleFile",
            suspicious: false,
          },
          {
            id: "data",
            label: "data/0 (tensor data)",
            type: "BinaryBlob",
            suspicious: false,
          },
          {
            id: "record",
            label: "metadata.pkl — SUSPICIOUS",
            type: "PickleFile",
            suspicious: true,
            children: [
              {
                id: "reduce",
                label: "__reduce__: os.system",
                type: "PickleReduce",
                suspicious: true,
              },
            ],
          },
        ],
      },
    ],
  },
];

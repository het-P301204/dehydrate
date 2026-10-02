import type { Node, Edge } from "@xyflow/react";

export interface GadgetChain {
  id: string;
  name: string;
  language: "Python" | "Java" | ".NET";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  affectedLibrary: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export const gadgetChains: GadgetChain[] = [
  {
    id: "gc-001",
    name: "Python Pickle Basic Chain",
    language: "Python",
    severity: "CRITICAL",
    affectedLibrary: "Python stdlib (pickle)",
    description:
      "Core pickle deserialization chain using __reduce__ to achieve OS command execution.",
    nodes: [
      {
        id: "n1",
        type: "input",
        position: { x: 50, y: 150 },
        data: {
          label: "Serialized Input",
          type: "InputNode",
          className: "bytes",
          pkg: "builtin",
          significance: "Entry point for attacker-controlled data",
          mitigation: "Validate and sign serialized data before processing",
        },
      },
      {
        id: "n2",
        position: { x: 250, y: 150 },
        data: {
          label: "pickle.loads()",
          type: "DeserializerNode",
          className: "pickle",
          pkg: "pickle (stdlib)",
          significance: "Executes arbitrary pickle opcodes from the input stream",
          mitigation: "Replace with safe alternatives like JSON or MessagePack",
        },
      },
      {
        id: "n3",
        position: { x: 450, y: 150 },
        data: {
          label: "__reduce__",
          type: "GadgetNode",
          className: "__reduce__",
          pkg: "python data model",
          significance: "Protocol hook that specifies a callable and arguments for reconstruction",
          mitigation: "Allowlist expected classes during deserialization",
        },
      },
      {
        id: "n4",
        position: { x: 650, y: 100 },
        data: {
          label: "subprocess.Popen",
          type: "TransformNode",
          className: "subprocess.Popen",
          pkg: "subprocess (stdlib)",
          significance: "Creates new OS process from attacker-specified command",
          mitigation: "Block subprocess module in deserialization scope",
        },
      },
      {
        id: "n5",
        position: { x: 850, y: 150 },
        data: {
          label: "OS Command",
          type: "execution",
          className: "OS Process",
          pkg: "system",
          significance: "Arbitrary code execution achieved",
          mitigation: "Sandbox deserialization environment with seccomp",
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "n1", target: "n2", animated: true },
      { id: "e2-3", source: "n2", target: "n3", animated: true },
      { id: "e3-4", source: "n3", target: "n4", animated: true },
      { id: "e4-5", source: "n4", target: "n5", animated: true },
    ],
  },
  {
    id: "gc-002",
    name: "Java Commons Collections 3.1",
    language: "Java",
    severity: "CRITICAL",
    affectedLibrary: "Apache Commons Collections 3.1",
    description:
      "Classic gadget chain using InvokerTransformer and ChainedTransformer to achieve Runtime.exec().",
    nodes: [
      {
        id: "n1",
        type: "input",
        position: { x: 50, y: 150 },
        data: {
          label: "Serialized Input",
          type: "InputNode",
          className: "byte[]",
          pkg: "java.io",
          significance: "Attacker-controlled serialized Java object stream",
          mitigation: "Reject serialized data from untrusted sources",
        },
      },
      {
        id: "n2",
        position: { x: 280, y: 150 },
        data: {
          label: "ObjectInputStream",
          type: "DeserializerNode",
          className: "ObjectInputStream",
          pkg: "java.io",
          significance: "Reads and reconstructs Java objects without type filtering",
          mitigation: "Implement ObjectInputFilter allowlist",
        },
      },
      {
        id: "n3",
        position: { x: 510, y: 80 },
        data: {
          label: "InvokerTransformer",
          type: "GadgetNode",
          className: "InvokerTransformer",
          pkg: "org.apache.commons.collections",
          significance: "Reflectively invokes arbitrary methods on input objects",
          mitigation: "Upgrade to Commons Collections 3.2.2+ or 4.1+",
        },
      },
      {
        id: "n4",
        position: { x: 510, y: 220 },
        data: {
          label: "ChainedTransformer",
          type: "GadgetNode",
          className: "ChainedTransformer",
          pkg: "org.apache.commons.collections",
          significance: "Chains multiple transformers to pass output as next input",
          mitigation: "Remove Commons Collections from classpath if unused",
        },
      },
      {
        id: "n5",
        position: { x: 740, y: 150 },
        data: {
          label: "Runtime.exec()",
          type: "TransformNode",
          className: "Runtime",
          pkg: "java.lang",
          significance: "Executes OS command via Java Runtime API",
          mitigation: "Apply SecurityManager restrictions",
        },
      },
      {
        id: "n6",
        position: { x: 960, y: 150 },
        data: {
          label: "Code Execution",
          type: "execution",
          className: "Process",
          pkg: "system",
          significance: "Arbitrary code execution achieved",
          mitigation: "Run JVM with minimal privileges",
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "n1", target: "n2", animated: true },
      { id: "e2-3", source: "n2", target: "n3", animated: true },
      { id: "e2-4", source: "n2", target: "n4", animated: true },
      { id: "e3-5", source: "n3", target: "n5", animated: true },
      { id: "e4-5", source: "n4", target: "n5", animated: true },
      { id: "e5-6", source: "n5", target: "n6", animated: true },
    ],
  },
  {
    id: "gc-003",
    name: ".NET BinaryFormatter Chain",
    language: ".NET",
    severity: "HIGH",
    affectedLibrary: ".NET BinaryFormatter",
    description:
      "BinaryFormatter deserialization chain leveraging ObjectManager and TypeForwardedTo attribute.",
    nodes: [
      {
        id: "n1",
        type: "input",
        position: { x: 50, y: 150 },
        data: {
          label: "Serialized Data",
          type: "InputNode",
          className: "byte[]",
          pkg: "System.IO",
          significance: "Binary serialized .NET object graph",
          mitigation: "Never deserialize untrusted data with BinaryFormatter",
        },
      },
      {
        id: "n2",
        position: { x: 280, y: 150 },
        data: {
          label: "BinaryFormatter",
          type: "DeserializerNode",
          className: "BinaryFormatter",
          pkg: "System.Runtime.Serialization.Formatters.Binary",
          significance: "Deprecated formatter that executes arbitrary type reconstruction",
          mitigation: "BinaryFormatter is disabled by default in .NET 5+",
        },
      },
      {
        id: "n3",
        position: { x: 510, y: 150 },
        data: {
          label: "ObjectManager",
          type: "GadgetNode",
          className: "ObjectManager",
          pkg: "System.Runtime.Serialization",
          significance: "Manages object reference fixups during deserialization",
          mitigation: "Use System.Text.Json or System.Xml.Serialization instead",
        },
      },
      {
        id: "n4",
        position: { x: 740, y: 100 },
        data: {
          label: "TypeForwardedTo",
          type: "GadgetNode",
          className: "TypeForwardedToAttribute",
          pkg: "System.Runtime.CompilerServices",
          significance: "Redirects type resolution to attacker-controlled assembly",
          mitigation: "Restrict type resolution in deserialization context",
        },
      },
      {
        id: "n5",
        position: { x: 960, y: 150 },
        data: {
          label: "Code Execution",
          type: "execution",
          className: "Gadget Target",
          pkg: "system",
          significance: "Arbitrary code execution via gadget target",
          mitigation: "Apply AppDomain sandboxing",
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "n1", target: "n2", animated: true },
      { id: "e2-3", source: "n2", target: "n3", animated: true },
      { id: "e3-4", source: "n3", target: "n4", animated: true },
      { id: "e4-5", source: "n4", target: "n5", animated: true },
    ],
  },
  {
    id: "gc-004",
    name: "PyYAML load() Chain",
    language: "Python",
    severity: "HIGH",
    affectedLibrary: "PyYAML < 5.1",
    description: "YAML deserialization chain via yaml.load() without Loader specification.",
    nodes: [
      {
        id: "n1",
        type: "input",
        position: { x: 50, y: 150 },
        data: {
          label: "YAML Input",
          type: "InputNode",
          className: "str",
          pkg: "builtin",
          significance: "Attacker-controlled YAML string with !!python/object tags",
          mitigation: "Never accept YAML from untrusted sources",
        },
      },
      {
        id: "n2",
        position: { x: 280, y: 150 },
        data: {
          label: "yaml.load()",
          type: "DeserializerNode",
          className: "yaml",
          pkg: "pyyaml",
          significance: "Without Loader=yaml.SafeLoader allows arbitrary Python object construction",
          mitigation: "Always use yaml.safe_load() or yaml.load(Loader=yaml.SafeLoader)",
        },
      },
      {
        id: "n3",
        position: { x: 510, y: 150 },
        data: {
          label: "!!python/object/apply",
          type: "GadgetNode",
          className: "Constructor",
          pkg: "yaml.constructor",
          significance: "YAML tag that invokes arbitrary Python callables",
          mitigation: "Use SafeLoader which blocks these tags",
        },
      },
      {
        id: "n4",
        position: { x: 740, y: 150 },
        data: {
          label: "os.system()",
          type: "execution",
          className: "os",
          pkg: "os (stdlib)",
          significance: "Arbitrary OS command execution",
          mitigation: "Use SafeLoader to prevent object construction",
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "n1", target: "n2", animated: true },
      { id: "e2-3", source: "n2", target: "n3", animated: true },
      { id: "e3-4", source: "n3", target: "n4", animated: true },
    ],
  },
  {
    id: "gc-005",
    name: "Celery Task Chain",
    language: "Python",
    severity: "HIGH",
    affectedLibrary: "Celery (pickle serializer)",
    description:
      "Celery worker RCE via crafted task message when pickle serializer is enabled.",
    nodes: [
      {
        id: "n1",
        type: "input",
        position: { x: 50, y: 150 },
        data: {
          label: "Broker Message",
          type: "InputNode",
          className: "bytes",
          pkg: "amqp/redis",
          significance: "Attacker-controlled task message injected into broker",
          mitigation: "Authenticate broker access; restrict who can publish",
        },
      },
      {
        id: "n2",
        position: { x: 280, y: 150 },
        data: {
          label: "Celery Worker",
          type: "DeserializerNode",
          className: "Worker",
          pkg: "celery",
          significance: "Reads and deserializes task messages from broker",
          mitigation: "Set CELERY_TASK_SERIALIZER=json",
        },
      },
      {
        id: "n3",
        position: { x: 510, y: 150 },
        data: {
          label: "pickle.loads()",
          type: "GadgetNode",
          className: "pickle",
          pkg: "pickle (stdlib)",
          significance: "Deserializes task body with full pickle execution",
          mitigation: "Disable pickle serializer in Celery config",
        },
      },
      {
        id: "n4",
        position: { x: 740, y: 150 },
        data: {
          label: "Code Execution",
          type: "execution",
          className: "Worker Process",
          pkg: "system",
          significance: "RCE in Celery worker process",
          mitigation: "Run workers with minimal privileges",
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "n1", target: "n2", animated: true },
      { id: "e2-3", source: "n2", target: "n3", animated: true },
      { id: "e3-4", source: "n3", target: "n4", animated: true },
    ],
  },
  {
    id: "gc-006",
    name: "Dask Distributed Chain",
    language: "Python",
    severity: "HIGH",
    affectedLibrary: "Dask",
    description:
      "Dask scheduler/worker RCE via crafted graph submission using pickle for task serialization.",
    nodes: [
      {
        id: "n1",
        type: "input",
        position: { x: 50, y: 150 },
        data: {
          label: "Task Graph Input",
          type: "InputNode",
          className: "dict",
          pkg: "dask",
          significance: "Attacker-submitted Dask computation graph",
          mitigation: "Authenticate Dask scheduler; restrict graph submission",
        },
      },
      {
        id: "n2",
        position: { x: 280, y: 150 },
        data: {
          label: "Scheduler",
          type: "DeserializerNode",
          className: "Scheduler",
          pkg: "distributed",
          significance: "Distributes tasks to workers via pickle serialization",
          mitigation: "Restrict scheduler network access",
        },
      },
      {
        id: "n3",
        position: { x: 510, y: 150 },
        data: {
          label: "Worker Deserialize",
          type: "GadgetNode",
          className: "Worker",
          pkg: "distributed",
          significance: "Worker unpickles task payloads",
          mitigation: "Use cryptographic verification for task graphs",
        },
      },
      {
        id: "n4",
        position: { x: 740, y: 150 },
        data: {
          label: "Code Execution",
          type: "execution",
          className: "Worker Process",
          pkg: "system",
          significance: "Arbitrary code on Dask worker",
          mitigation: "Sandbox worker processes",
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "n1", target: "n2", animated: true },
      { id: "e2-3", source: "n2", target: "n3", animated: true },
      { id: "e3-4", source: "n3", target: "n4", animated: true },
    ],
  },
];

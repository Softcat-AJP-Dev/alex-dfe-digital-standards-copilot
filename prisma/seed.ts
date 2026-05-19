// Seed data for DfE Digital and Technology Standards categories + criteria.
// Run via: npx prisma db seed (or manually INSERT after migrate deploy).

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "broadband-internet",
    name: "Broadband Internet",
    description:
      "Get the right connection type and speed, and a backup connection to ensure resilience.",
    isCore: true,
    sortOrder: 1,
    criteria: [
      {
        slug: "broadband-full-fibre",
        title: "Full fibre broadband connection",
        description:
          "Primary schools: min 100Mbps down / 30Mbps up. Secondary/FE: capacity for 1Gbps symmetric.",
        guidance:
          "1: No fibre; relying on copper ADSL. 2: Part-fibre (FTTC). 3: Full fibre ordered/installed but not optimised. 4: Full fibre active, meeting DfE speed targets. 5: Leased line with SLA, exceeding targets.",
      },
      {
        slug: "broadband-backup-connection",
        title: "Backup broadband connection for resilience",
        description:
          "Multiple broadband services of different types with automatic failover.",
        guidance:
          "1: No backup. 2: Manual failover (e.g. 4G dongle). 3: Secondary connection, manual switchover. 4: Automatic failover with different service types. 5: Fully redundant with diverse routes and tested DR.",
      },
    ],
  },
  {
    slug: "cyber-security",
    name: "Cyber Security",
    description:
      "Keep your school cyber secure and control and secure user accounts.",
    isCore: true,
    sortOrder: 2,
    criteria: [
      {
        slug: "cyber-risk-assessment",
        title: "Conduct a cyber risk assessment annually",
        description:
          "Annual risk assessment reviewed every term, covering all digital technology.",
        guidance:
          "1: No risk assessment. 2: Informal awareness of risks. 3: Initial assessment done but not reviewed. 4: Annual assessment with termly reviews. 5: Continuous risk management with board reporting.",
      },
      {
        slug: "cyber-antimalware-firewall",
        title: "Anti-malware and firewall protection",
        description:
          "All devices protected with up-to-date anti-malware and properly configured firewalls.",
        guidance:
          "1: No or expired protection. 2: Partial coverage, not centrally managed. 3: All devices covered but updates inconsistent. 4: Centrally managed, auto-updating protection on all devices. 5: EDR/XDR with SOC monitoring and incident response.",
      },
      {
        slug: "cyber-user-accounts",
        title: "Secure user account management",
        description:
          "Controlled account creation/removal, MFA for staff, least-privilege access.",
        guidance:
          "1: Shared accounts, no process. 2: Individual accounts but no MFA. 3: MFA for admins, joiners/leavers process exists. 4: MFA for all staff, automated provisioning, regular access reviews. 5: Zero-trust architecture, continuous authentication.",
      },
      {
        slug: "cyber-backup-plan",
        title: "Data backup plan reviewed annually",
        description:
          "3-2-1 backup rule for critical data, tested restores, documented plan.",
        guidance:
          "1: No backups. 2: Ad-hoc backups, never tested. 3: Regular backups but no offsite or testing. 4: 3-2-1 backups with annual restore testing. 5: Immutable backups, automated testing, <4h RTO.",
      },
      {
        slug: "cyber-incident-response",
        title: "Cyber incident response plan",
        description:
          "Documented plan with roles, tested annually, aligned to NCSC guidance.",
        guidance:
          "1: No plan. 2: Informal understanding of what to do. 3: Written plan but untested. 4: Tested plan with defined roles and communication. 5: Regular tabletop exercises, links to NCSC, insurance in place.",
      },
    ],
  },
  {
    slug: "digital-leadership-governance",
    name: "Digital Leadership & Governance",
    description:
      "Effective digital technology leadership, governance, roles and processes.",
    isCore: true,
    sortOrder: 3,
    criteria: [
      {
        slug: "governance-slt-digital-lead",
        title: "SLT member responsible for digital technology",
        description:
          "A named SLT member accountable for digital strategy and standards.",
        guidance:
          "1: No ownership assigned. 2: Informally handled by IT support. 3: Named SLT lead but limited engagement. 4: Active SLT lead with clear remit and governor link. 5: Digital lead embedded in SLT decisions, governor champion appointed.",
      },
      {
        slug: "governance-registers",
        title: "Up-to-date asset, contract and information registers",
        description:
          "Contracts register, asset register, and information asset register maintained.",
        guidance:
          "1: No registers. 2: Partial/outdated records. 3: Registers exist but not routinely updated. 4: All registers current, reviewed before financial planning. 5: Automated asset discovery, live dashboards, proactive renewal management.",
      },
      {
        slug: "governance-disaster-recovery",
        title: "Disaster recovery and business continuity plans",
        description:
          "DR and BC plans covering digital technology, tested annually.",
        guidance:
          "1: No plans. 2: General BC plan without digital specifics. 3: Digital DR plan exists but untested. 4: Tested annually, hard copies available, staff briefed. 5: Regular simulation exercises, suppliers integrated, continuous improvement.",
      },
      {
        slug: "governance-digital-strategy",
        title: "Digital technology strategy reviewed annually",
        description:
          "Strategy aligned to school development plan, reviewed yearly with stakeholder input.",
        guidance:
          "1: No strategy. 2: Informal plans driven by IT support. 3: Written strategy but not reviewed. 4: Annual review with SLT, curriculum and finance input. 5: Living strategy with clear KPIs, governor oversight, evidence of impact.",
      },
    ],
  },
  {
    slug: "filtering-monitoring",
    name: "Filtering & Monitoring",
    description:
      "Provide a safe online environment with appropriate filtering and monitoring systems.",
    isCore: true,
    sortOrder: 4,
    criteria: [
      {
        slug: "filtering-roles-responsibilities",
        title: "Clear roles and responsibilities for filtering & monitoring",
        description:
          "SLT, DSL and IT support roles documented with accountability for filtering/monitoring.",
        guidance:
          "1: No defined roles. 2: IT handles it alone informally. 3: Roles documented but DSL not actively involved. 4: Clear accountability across SLT/DSL/IT, staff trained. 5: Regular cross-functional reviews, governor oversight.",
      },
      {
        slug: "filtering-annual-review",
        title: "Annual review of filtering and monitoring provision",
        description:
          "Yearly review considering student risk profile, system capabilities and policy alignment.",
        guidance:
          "1: Never reviewed. 2: Only after incidents. 3: Informal annual check. 4: Formal annual review with documented outcomes and actions. 5: Continuous review cycle, informed by data, feeding into strategy.",
      },
      {
        slug: "filtering-harmful-content",
        title: "Filtering blocks harmful and inappropriate content",
        description:
          "IWF and CTIRU blocklists active; age-appropriate profiles; covers all devices.",
        guidance:
          "1: No filtering. 2: Basic filtering, not all devices covered. 3: Filtering on school network only, not BYOD/off-site. 4: All devices covered, IWF/CTIRU active, profiles by user type. 5: Real-time content analysis, VPN/proxy blocking, regular testing.",
      },
      {
        slug: "filtering-monitoring-strategies",
        title: "Effective monitoring strategies",
        description:
          "Technical and manual monitoring proportionate to risk, with alert/reporting processes.",
        guidance:
          "1: No monitoring. 2: Manual only (teacher observation). 3: Technical monitoring on some devices. 4: Comprehensive monitoring, alerts to DSL, documented responses. 5: AI-enhanced monitoring, proactive intervention, trend analysis.",
      },
    ],
  },
  {
    slug: "network-switching",
    name: "Network Switching",
    description:
      "Proper network switches and switching infrastructure for reliability, security and resilience.",
    isCore: true,
    sortOrder: 5,
    criteria: [
      {
        slug: "switching-performance",
        title: "Network switches meet performance requirements",
        description:
          "Managed switches with adequate port speeds, PoE for access points, VLAN support.",
        guidance:
          "1: Unmanaged/consumer switches. 2: Mix of managed and unmanaged. 3: All managed but aging/under-spec. 4: Enterprise-grade, adequate PoE budget, VLAN-configured. 5: Latest generation with full redundancy, monitoring and capacity headroom.",
      },
      {
        slug: "switching-resilience",
        title: "Network resilience and redundancy",
        description:
          "Redundant uplinks, UPS protection, and failover for critical paths.",
        guidance:
          "1: Single points of failure throughout. 2: UPS on core only. 3: Some redundancy in core, edge is single-path. 4: Redundant core, UPS on all comms rooms, monitoring. 5: Full mesh/ring topology, automatic failover, regular testing.",
      },
    ],
  },
  {
    slug: "wireless-network",
    name: "Wireless Network",
    description:
      "Latest wireless network standards for performance, coverage, management and security.",
    isCore: true,
    sortOrder: 6,
    criteria: [
      {
        slug: "wireless-performance",
        title: "Wi-Fi performance meets educational needs",
        description:
          "Latest Wi-Fi standard (Wi-Fi 7 / 802.11be), supporting concurrent use of all devices.",
        guidance:
          "1: Wi-Fi 4 or older, frequent dropouts. 2: Wi-Fi 5, insufficient capacity. 3: Wi-Fi 6, adequate for current use. 4: Wi-Fi 6E/7, designed for full device load. 5: Wi-Fi 7 with capacity planning, QoS and future-proofing.",
      },
      {
        slug: "wireless-coverage",
        title: "Full coverage across all learning spaces",
        description:
          "Access points in all classrooms, with higher-spec units in halls/large spaces.",
        guidance:
          "1: Patchy coverage, many dead spots. 2: Coverage in main areas only. 3: Most classrooms covered, some gaps. 4: Full site coverage validated by heat mapping. 5: Continuous monitoring, automatic AP steering, 100% coverage.",
      },
      {
        slug: "wireless-management",
        title: "Central wireless management and monitoring",
        description:
          "Cloud or on-prem controller for configuration, firmware updates and alerting.",
        guidance:
          "1: Standalone APs, no central management. 2: Basic management, manual updates. 3: Central controller, some automation. 4: Cloud-managed, auto firmware updates, alerting. 5: AI-optimised, predictive maintenance, full visibility.",
      },
      {
        slug: "wireless-security",
        title: "Wireless network security",
        description:
          "WPA3, certificate-based auth, network segregation, guest isolation.",
        guidance:
          "1: Open or WPA2-Personal. 2: WPA2-Enterprise but shared credentials. 3: WPA2/3-Enterprise with individual auth. 4: WPA3, VLANs, certificate auth, guest isolation. 5: Zero-trust wireless, WIPS, MFA for admin, regular pen testing.",
      },
    ],
  },
  {
    slug: "cloud-solutions",
    name: "Cloud Solutions",
    description:
      "Use or move to cloud solutions, managing access, availability, data protection and backup.",
    isCore: false,
    sortOrder: 7,
    criteria: [
      {
        slug: "cloud-migration",
        title: "Migration from on-premise to cloud",
        description:
          "Assessment of services suitable for cloud; progressive migration where beneficial.",
        guidance:
          "1: All on-premise, no cloud strategy. 2: Some SaaS (e.g. email) but ad-hoc. 3: Assessment done, migration plan in place. 4: Majority cloud, hybrid only where justified. 5: Cloud-first policy, optimised costs, minimal on-prem.",
      },
      {
        slug: "cloud-data-protection",
        title: "Cloud data protection and GDPR compliance",
        description:
          "DPIAs done, data residency in UK/EU, sharing agreements in place.",
        guidance:
          "1: No awareness of cloud data risks. 2: Some awareness but no DPIAs. 3: DPIAs for key systems, gaps in others. 4: All cloud systems assessed, compliant agreements. 5: Continuous compliance monitoring, automated data governance.",
      },
      {
        slug: "cloud-id-management",
        title: "Central ID and access management",
        description:
          "Single sign-on for all cloud services, documented joiners/leavers process.",
        guidance:
          "1: Multiple separate logins per user. 2: SSO for some systems. 3: SSO for most, joiners/leavers partially automated. 4: Full SSO, automated provisioning/deprovisioning. 5: Conditional access policies, real-time risk-based auth.",
      },
      {
        slug: "cloud-backup",
        title: "Cloud data backup provision",
        description:
          "Backup needs assessed per solution; critical data follows 3-2-1 rule.",
        guidance:
          "1: Relying solely on provider defaults. 2: Aware of backup gaps, no action. 3: Third-party backup for critical data. 4: All cloud data backup assessed and provisioned. 5: Automated backup verification, tested recovery, documented RTOs.",
      },
    ],
  },
  {
    slug: "digital-accessibility",
    name: "Digital Accessibility",
    description:
      "Digital products, content and services accessible and usable for all.",
    isCore: false,
    sortOrder: 8,
    criteria: [
      {
        slug: "accessibility-awareness",
        title: "Accessibility awareness and policy",
        description:
          "Staff understand accessibility requirements; policy in place for digital content.",
        guidance:
          "1: No awareness. 2: Some staff aware, no policy. 3: Policy exists, limited implementation. 4: Policy embedded, training provided, content audited. 5: Proactive inclusion, user testing with diverse users, WCAG 2.2 AA.",
      },
      {
        slug: "accessibility-assistive-tech",
        title: "Assistive technology provision",
        description:
          "Appropriate assistive technology available for students with SEND.",
        guidance:
          "1: No provision. 2: Reactive provision on request. 3: Some standard tools available. 4: Needs-assessed provision, staff trained to support. 5: Comprehensive provision, integrated into teaching, regularly reviewed.",
      },
    ],
  },
  {
    slug: "it-support",
    name: "IT Support",
    description:
      "Plan, commission and review IT support services for suitable digital technology support.",
    isCore: false,
    sortOrder: 9,
    criteria: [
      {
        slug: "it-support-meeting-standards",
        title: "IT support helps meet digital standards",
        description:
          "Support team understands and actively works towards DfE standards.",
        guidance:
          "1: Unaware of standards. 2: Aware but no structured approach. 3: Standards referenced in support planning. 4: Active progress tracking against standards. 5: Support SLA linked to standards compliance, continuous improvement.",
      },
      {
        slug: "it-support-responsiveness",
        title: "IT support responsiveness and service levels",
        description:
          "Clear SLAs, priority system, recorded tickets, regular review.",
        guidance:
          "1: No SLA, ad-hoc response. 2: Informal expectations, no tracking. 3: Basic ticket system, response targets set. 4: Full helpdesk with SLAs, reporting, escalation paths. 5: Proactive monitoring, self-service options, user satisfaction tracked.",
      },
      {
        slug: "it-support-annual-review",
        title: "Annual IT support review",
        description:
          "Yearly review of support effectiveness, capacity, skills and value for money.",
        guidance:
          "1: Never reviewed. 2: Only when problems arise. 3: Informal annual discussion. 4: Structured annual review with documented outcomes. 5: Data-driven review with benchmarking, feeds into strategy.",
      },
    ],
  },
  {
    slug: "devices",
    name: "Devices (Laptops, Desktops & Tablets)",
    description:
      "Get the right digital devices for teaching and learning.",
    isCore: false,
    sortOrder: 10,
    criteria: [
      {
        slug: "devices-educational-needs",
        title: "Devices meet educational needs",
        description:
          "Device fleet aligned to curriculum requirements and digital strategy.",
        guidance:
          "1: Outdated/insufficient devices. 2: Some modern devices, gaps in provision. 3: Devices adequate but not strategically planned. 4: Fleet aligned to strategy, lifecycle planned, meets curriculum needs. 5: 1:1 or optimal ratio, choice of form factor, futureproofed.",
      },
      {
        slug: "devices-management",
        title: "Device management and security",
        description:
          "MDM/endpoint management, patching, encryption, BYOD policy.",
        guidance:
          "1: Unmanaged devices. 2: Partial management (some enrolled). 3: MDM for school devices, no BYOD policy. 4: Full MDM, auto-patching, encryption, BYOD managed. 5: Zero-touch deployment, conditional access, remote wipe capability.",
      },
      {
        slug: "devices-sustainability",
        title: "Sustainable procurement and disposal",
        description:
          "Energy-efficient devices, sustainable purchasing, secure disposal.",
        guidance:
          "1: No consideration of sustainability. 2: Some recycling, no policy. 3: Disposal process documented, some green purchasing. 4: WEEE-compliant disposal, EPEAT-rated procurement, lifecycle costing. 5: Circular economy approach, carbon-tracked, social value considered.",
      },
    ],
  },
  {
    slug: "network-cabling",
    name: "Network Cabling",
    description:
      "Right copper cabling, optical fibre and installation standards.",
    isCore: false,
    sortOrder: 11,
    criteria: [
      {
        slug: "cabling-copper-standard",
        title: "Copper cabling meets current standards",
        description:
          "Cat6/6A minimum, properly installed, tested and documented.",
        guidance:
          "1: Cat5 or unknown cabling. 2: Mix of standards, some Cat5e. 3: Mostly Cat5e/6, some documentation. 4: Cat6A throughout, certified installation, full documentation. 5: Cat6A/Cat7, future-proofed for 10GbE, labelled and maintained.",
      },
      {
        slug: "cabling-fibre-backbone",
        title: "Fibre backbone between buildings/floors",
        description:
          "Single-mode or multi-mode fibre linking distribution points.",
        guidance:
          "1: Copper-only backbone. 2: Some fibre but aging/single-mode only in parts. 3: Fibre backbone installed, adequate capacity. 4: Multi-mode/single-mode as appropriate, redundant paths. 5: High-count fibre with spare capacity, future 40/100G ready.",
      },
    ],
  },
  {
    slug: "servers-storage",
    name: "Servers & Storage",
    description:
      "Right servers and storage, including security, energy efficiency and environments.",
    isCore: false,
    sortOrder: 12,
    criteria: [
      {
        slug: "servers-security-compliance",
        title: "Server security and data protection compliance",
        description:
          "Servers patched, access-controlled, encrypted, GDPR-compliant.",
        guidance:
          "1: Unpatched, shared admin passwords. 2: Some patching, basic access control. 3: Regular patching, individual admin accounts. 4: Automated patching, encrypted at rest, access logged. 5: Hardened, monitored, pen-tested, compliance certified.",
      },
      {
        slug: "servers-environment",
        title: "Appropriate physical server environment",
        description:
          "Dedicated server room/cabinet with cooling, power protection and access control.",
        guidance:
          "1: Under a desk / in an open area. 2: Locked cupboard, no climate control. 3: Dedicated room, basic cooling. 4: Purpose-built with UPS, cooling, fire suppression, access control. 5: Data-centre grade or fully migrated to cloud.",
      },
      {
        slug: "servers-energy-efficiency",
        title: "Energy-efficient and sustainable servers",
        description:
          "Right-sized, virtualised where possible, energy monitoring.",
        guidance:
          "1: Old hardware, no virtualisation. 2: Some virtualisation, oversized hardware. 3: Mostly virtualised, lifecycle planned. 4: Right-sized, energy-monitored, replacement cycle. 5: Cloud-first, remaining on-prem fully optimised, carbon-tracked.",
      },
    ],
  },
];

async function main() {
  console.log("Seeding DfE Digital Standards...");

  for (const cat of categories) {
    const { criteria, ...catData } = cat;
    const created = await prisma.standardCategory.upsert({
      where: { slug: catData.slug },
      update: catData,
      create: catData,
    });

    for (let i = 0; i < criteria.length; i++) {
      const crit = criteria[i]!;
      await prisma.standardCriterion.upsert({
        where: { slug: crit.slug },
        update: { ...crit, categoryId: created.id, sortOrder: i + 1 },
        create: { ...crit, categoryId: created.id, sortOrder: i + 1 },
      });
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

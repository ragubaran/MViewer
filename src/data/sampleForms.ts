import { computeSha256 } from '../utils/crypto';

export interface SampleFormTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
}

export const SAMPLE_TEMPLATES: Record<string, {
  title: string;
  category: string;
  description: string;
  templateBody: string;
}> = {
  medical: {
    title: 'Patient Intake & Medical History Form',
    category: 'Healthcare',
    description: 'HIPAA-compliant confidential medical registration and history disclosure.',
    templateBody: `# Patient Intake & Medical History Form
**St. Jude Memorial Health Center** | *Confidential Patient Record*

Please complete this medical history prior to your appointment. All disclosures are protected under healthcare privacy laws.

---

### 1. Patient Identification
- **Full Legal Name:** {{input:patient_name label="Patient Full Name" required=true placeholder="e.g. Eleanor Vance"}}
- **Date of Birth:** {{date:dob label="Date of Birth" required=true}}
- **Biological Sex & Pronouns:** {{select:gender label="Gender" options="Female, Male, Non-Binary, Other, Prefer not to state"}}
- **Primary Phone:** {{phone:patient_phone label="Mobile Phone" placeholder="+1 (555) 000-0000" required=true}}
- **Email Address:** {{email:patient_email label="Email Address" placeholder="patient@example.com" required=true}}

---

### 2. Emergency Contact
- **Emergency Contact Name:** {{input:emergency_name label="Contact Name" placeholder="e.g. John Vance"}}
- **Relationship:** {{select:emergency_relation label="Relationship" options="Spouse, Parent, Sibling, Child, Friend, Guardian"}}
- **Contact Phone:** {{phone:emergency_phone label="Emergency Phone Number" required=true}}

---

### 3. Medical History & Allergies
- **Known Allergies:**
  {{choice:allergies label="Select all that apply" options="Penicillin, Peanuts / Tree Nuts, Latex, Sulfa Drugs, Shellfish, NSAIDs (Aspirin/Ibuprofen), None" mode="multiple" style="chips"}}

- **Current Physical Wellbeing Score:**
  {{scale:wellbeing_score label="Rate your overall health condition today" min=1 max=10 lowLabel="Poor / Severe Pain" highLabel="Excellent / Peak Health"}}

- **Are you currently taking any prescription medications?**
  {{yesno:taking_meds label="Current Prescriptions"}}

- **Past Conditions or Relevant Symptoms:**
  {{textarea:medical_notes label="Medical Notes" rows=3 placeholder="List any past surgeries, chronic illnesses, or current symptoms..."}}

---

### 4. Legal Acknowledgment & Consent
> *I certify that the medical history provided above is comprehensive and accurate to the best of my knowledge. I consent to medical examination and diagnostic procedures deemed necessary by attending physicians.*

{{legal:patient_consent label="I have read, understood, and accept the medical treatment & privacy terms." required=true}}

**Patient / Legal Guardian Signature:**
{{signature:patient_signature label="Digital Signature" required=true}}`,
  },

  nda: {
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Legal',
    description: 'Standard two-party bilateral confidential information agreement.',
    templateBody: `# Mutual Non-Disclosure Agreement (NDA)
**Document ID: NDA-2026-SEC-09**

This Mutual Non-Disclosure Agreement ("Agreement") is entered into to protect proprietary and confidential business information exchanged between the parties.

---

### 1. Parties & Effective Date
- **Disclosing Company / Party:** {{input:party_a label="Disclosing Party Name" placeholder="Acme Corp LLC" required=true}}
- **Receiving Company / Party:** {{input:party_b label="Receiving Party Name" placeholder="Apex Innovations Inc" required=true}}
- **Effective Commencement Date:** {{date:effective_date label="Effective Date" required=true}}
- **Governing Jurisdiction:** {{select:jurisdiction label="Applicable Law" options="Delaware (US), California (US), United Kingdom, Singapore, European Union (Germany)"}}

---

### 2. Scope & Duration of Confidentiality
The Receiving Party agrees that all technical specifications, code, designs, and financial materials disclosed shall be kept strictly confidential.

- **Confidentiality Term:**
  {{slider:term_years label="Duration of Obligation (Years)" min=1 max=10 step=1 unit=" years"}}

- **Does this agreement cover pre-existing disclosures prior to the effective date?**
  {{yesno:retroactive_coverage label="Retroactive Protection"}}

- **Permitted Disclosures Category:**
  {{choice:permitted_disclosures label="Permitted Receivers" options="Employees with Need-to-Know, Legal Counsel, Financial Auditors, Board Members" mode="multiple" style="checkbox"}}

- **Special Terms or Exclusions:**
  {{textarea:custom_terms label="Additional Covenants" rows=2 placeholder="Any non-standard clauses agreed upon by both legal counsels..."}}

---

### 3. Execution & Digital Attestation
By signing below, the authorized signatories warrant that they hold proper corporate power to bind their respective organizations.

- **Signatory Full Name:** {{input:signatory_name label="Authorized Signatory" required=true}}
- **Corporate Title:** {{input:signatory_title label="Title" placeholder="e.g. Chief Executive Officer" required=true}}
- **Signatory Corporate Email:** {{email:signatory_email label="Corporate Email" required=true}}

{{legal:legal_binding label="I confirm under penalty of law that I have authority to execute this mutual covenant." required=true}}

**Authorized Execution Signature:**
{{signature:exec_signature label="Authorized Signature" required=true}}`,
  },

  job_application: {
    title: 'Senior Software Engineer Application',
    category: 'HR & Recruiting',
    description: 'Interactive job applicant screening and qualification form.',
    templateBody: `# Senior Software Engineer Application
**Veritas Tech Labs** | *Engineering Team*

Thank you for your interest in joining our engineering team. Please provide your professional credentials below.

---

### 1. Candidate Details
- **Candidate Name:** {{input:applicant_name label="Full Name" required=true placeholder="e.g. Alexander Brooks"}}
- **Email:** {{email:applicant_email label="Personal Email" required=true placeholder="alex@domain.com"}}
- **Phone:** {{phone:applicant_phone label="Contact Phone" required=true}}
- **GitHub / Portfolio URL:** {{url:portfolio_url label="Portfolio or GitHub Profile" placeholder="https://github.com/..."}}

---

### 2. Technical Qualifications & Skills
- **Core Proficiencies:**
  {{choice:core_skills label="Select technologies you are proficient with" options="TypeScript, Rust, React, Go, Node.js / Bun, Python, PostgreSQL, Kubernetes" mode="multiple" style="chips"}}

- **Total Years of Professional Software Engineering Experience:**
  {{slider:years_experience label="Years of Experience" min=1 max=20 step=1 unit=" years"}}

- **Self-Assessed System Architecture Mastery:**
  {{rating:architecture_rating label="System Design & Scalability" max=5 icon="star"}}

- **Earliest Available Start Date:**
  {{date:available_date label="Available Start Date" required=true}}

- **Target Annual Base Compensation:**
  {{currency:desired_salary label="Desired Salary (USD)" prefix="$" suffix="/ yr" placeholder="185,000"}}

---

### 3. Background & Work Authorization
- **Are you legally authorized to work in the country of this posting?**
  {{yesno:work_auth label="Work Authorization" required=true}}

- **Resume / Curriculum Vitae:**
  {{file:resume_file label="Upload Resume (PDF, DOCX)" accept=".pdf,.docx,.txt"}}

- **Why are you excited about Veritas Tech Labs?**
  {{textarea:pitch label="Candidate Statement" rows=3 placeholder="Tell us briefly about a project you are proud of..."}}

---

### 4. Verification & Attestation
{{legal:accuracy_confirmation label="I certify that all statements in this application are accurate and truthful." required=true}}

**Candidate Signature:**
{{signature:applicant_sig label="Signature" required=true}}`,
  },

  safety_audit: {
    title: 'Facility Safety & Environmental Audit',
    category: 'Operations',
    description: 'On-site workplace compliance and hazard assessment protocol.',
    templateBody: `# Facility Safety & Environmental Audit
**Division of Health & Safety Oversight** | *Daily Site Inspection*

---

### 1. Inspection Context
- **Facility Location / Plant Code:** {{select:plant_code label="Facility Location" options="Plant Alpha (Chicago), Plant Beta (Austin), Plant Gamma (Berlin), Distribution Hub East"}}
- **Lead Safety Auditor:** {{input:auditor_name label="Auditor Full Name" required=true}}
- **Inspection Date:** {{date:audit_date label="Date of Inspection" required=true}}

---

### 2. Compliance Checklist
- **Fire & Emergency Preparedness:**
  {{choice:fire_safety label="Fire Safety Status" options="Extinguishers Inspected & Charged, Emergency Exits Clear & Illuminated, Sprinkler Pressure Nominal, Fire Alarms Tested" mode="multiple" style="checkbox"}}

- **PPE (Personal Protective Equipment) Adherence:**
  {{scale:ppe_adherence label="Rate floor workers PPE compliance" min=1 max=10 lowLabel="Low / Infractions observed" highLabel="100% Full Compliance"}}

- **Were any immediate safety hazards identified today?**
  {{yesno:hazard_detected label="Immediate Hazard Identified"}}

- **Observations & Corrective Actions Required:**
  {{textarea:corrective_actions label="Hazard Notes" rows=3 placeholder="Describe any spills, blocked egress, or machinery anomalies..."}}

---

### 3. Final Sign-off
{{legal:audit_certified label="This inspection has been conducted in strict compliance with safety regulations." required=true}}

**Lead Auditor Signature:**
{{signature:auditor_sig label="Auditor Signature" required=true}}`,
  },
};

/**
 * Generates ready-to-use FormDocument objects with sealed SHA-256 checksums!
 */
export async function getSealedSampleForm(key: string): Promise<string> {
  const sample = SAMPLE_TEMPLATES[key] || SAMPLE_TEMPLATES.medical;
  const checksum = await computeSha256(sample.templateBody);

  return `---
title: "${sample.title}"
template_id: "${key}-v1"
version: "1.0.0"
template_checksum: "${checksum}"
status: "template"
author: "DocuMark / MDViewer Systems"
created_at: "2026-09-04"
form_data: {}
---

${sample.templateBody}
`;
}

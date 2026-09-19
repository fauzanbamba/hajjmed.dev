export const regulatoryExclusionCodes=['RENAL_DIALYSIS','ADVANCED_HEART_FAILURE','OXYGEN_DEPENDENT_LUNG_DISEASE','DECOMPENSATED_CIRRHOSIS','SEVERE_NEUROPSYCHIATRIC_IMPAIRMENT','SENILITY_WITH_DEMENTIA','LATE_OR_HIGH_RISK_PREGNANCY','ACTIVE_PUBLIC_HEALTH_INFECTION','ACTIVE_CANCER_IMMUNOSUPPRESSIVE_TREATMENT'] as const;
export const regulatorySourceVersion='KSA-MOH-HAJJ-1447H-2026';
export const requiresRegulatoryHardRed=(codes:readonly string[])=>codes.length>0;
export const mayReviewRegulatoryHardRed=(role:string)=>role==='ADMIN'||role==='MEDICAL_DIRECTOR';

export function fitnessCertificateAuthenticated(input:{authenticatedAt:Date|null;administratorAuthenticatedAt:Date|null}){
  return Boolean(input.authenticatedAt||input.administratorAuthenticatedAt);
}

export function unifiedQrAuthenticated(input:{authenticatedAt:Date|null;administratorAuthenticatedAt:Date|null}){
  return Boolean(input.authenticatedAt&&input.administratorAuthenticatedAt);
}

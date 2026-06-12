let _passphrase: string | null = null;
let _isUnlocked = false;

export function getPassphrase(): string | null { return _passphrase; }
export function isUnlocked(): boolean { return _isUnlocked; }
export function setPassphrase(p: string) { _passphrase = p; _isUnlocked = true; }
export function lock() { _passphrase = null; _isUnlocked = false; }
